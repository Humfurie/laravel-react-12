<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\WebScraperService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WebScraperController extends Controller
{
    public function __construct(
        private WebScraperService $scraperService
    ) {}

    /**
     * Search the web for content related to a topic
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'max_results' => 'nullable|integer|min:1|max:20'
        ]);

        $topic = $request->input('topic');
        $maxResults = $request->input('max_results', 10);

        try {
            $results = $this->scraperService->searchWeb($topic, $maxResults);

            return response()->json([
                'success' => true,
                'results' => $results,
                'count' => count($results)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Scrape content from a specific URL
     */
    public function scrape(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
            'include_images' => 'nullable|boolean',
            'summarize' => 'nullable|boolean',
            'summary_length' => 'nullable|integer|min:100|max:1000'
        ]);

        $url = $request->input('url');
        $includeImages = $request->boolean('include_images', true);
        $summarize = $request->boolean('summarize', true);
        $summaryLength = $request->input('summary_length', 500);

        try {
            $scrapedData = $this->scraperService->scrapeContent($url);

            if (!$scrapedData['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $scrapedData['error']
                ], 400);
            }

            $response = [
                'success' => true,
                'title' => $scrapedData['title'],
                'content' => $scrapedData['content'],
                'url' => $scrapedData['url']
            ];

            // Add summary if requested
            if ($summarize && !empty($scrapedData['content'])) {
                $response['summary'] = $this->scraperService->summarizeContent(
                    $scrapedData['content'],
                    $summaryLength
                );
            }

            // Process images if requested
            if ($includeImages && !empty($scrapedData['images'])) {
                $response['images'] = $scrapedData['images'];
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Scraping failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download and process images from scraped content
     */
    public function downloadImages(Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array|max:5',
            'images.*.url' => 'required|url',
            'images.*.alt' => 'nullable|string'
        ]);

        $images = $request->input('images');
        $processedImages = [];
        $errors = [];

        foreach ($images as $image) {
            $result = $this->scraperService->downloadAndProcessImage($image['url']);

            if ($result) {
                $processedImages[] = [
                    'original_url' => $image['url'],
                    'local_path' => $result['path'],
                    'public_url' => $result['url'],
                    'filename' => $result['filename'],
                    'size' => $result['size'],
                    'alt' => $image['alt'] ?? ''
                ];
            } else {
                $errors[] = [
                    'url' => $image['url'],
                    'error' => 'Failed to download image'
                ];
            }
        }

        return response()->json([
            'success' => true,
            'processed_images' => $processedImages,
            'errors' => $errors,
            'total_processed' => count($processedImages),
            'total_errors' => count($errors)
        ]);
    }

    /**
     * Get comprehensive content for blog creation
     */
    public function getContentForBlog(Request $request): JsonResponse
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'urls' => 'nullable|array|max:5',
            'urls.*' => 'url',
            'auto_search' => 'nullable|boolean',
            'include_images' => 'nullable|boolean'
        ]);

        $topic = $request->input('topic');
        $urls = $request->input('urls', []);
        $autoSearch = $request->boolean('auto_search', true);
        $includeImages = $request->boolean('include_images', true);

        try {
            $result = [
                'success' => true,
                'topic' => $topic,
                'sources' => [],
                'combined_content' => '',
                'suggested_title' => '',
                'summary' => '',
                'images' => []
            ];

            // Auto-search if no URLs provided or auto_search is enabled
            if (empty($urls) || $autoSearch) {
                $searchResults = $this->scraperService->searchWeb($topic, 5);
                $urls = array_merge($urls, array_column($searchResults, 'url'));
            }

            // Remove duplicates
            $urls = array_unique($urls);
            $urls = array_slice($urls, 0, 5); // Limit to 5 URLs

            $allContent = [];
            $allImages = [];

            foreach ($urls as $url) {
                $scrapedData = $this->scraperService->scrapeContent($url);

                if ($scrapedData['success']) {
                    $source = [
                        'url' => $url,
                        'title' => $scrapedData['title'],
                        'content_length' => strlen($scrapedData['content']),
                        'summary' => $this->scraperService->summarizeContent($scrapedData['content'], 200)
                    ];

                    $result['sources'][] = $source;
                    $allContent[] = $scrapedData['content'];

                    if ($includeImages && !empty($scrapedData['images'])) {
                        $allImages = array_merge($allImages, $scrapedData['images']);
                    }
                }
            }

            // Combine and process content
            $combinedContent = implode("\n\n", $allContent);
            $result['combined_content'] = $combinedContent;

            // Generate suggested title
            $result['suggested_title'] = $this->generateTitle($topic, $result['sources']);

            // Create comprehensive summary
            if (!empty($combinedContent)) {
                $result['summary'] = $this->scraperService->summarizeContent($combinedContent, 800);
            }

            // Limit and deduplicate images
            $uniqueImages = [];
            $seenUrls = [];

            foreach ($allImages as $image) {
                if (!in_array($image['url'], $seenUrls) && count($uniqueImages) < 10) {
                    $uniqueImages[] = $image;
                    $seenUrls[] = $image['url'];
                }
            }

            $result['images'] = $uniqueImages;

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Content gathering failed: ' . $e->getMessage()
            ], 500);
        }
    }

    private function generateTitle(string $topic, array $sources): string
    {
        // Start with the topic
        $title = ucwords($topic);

        // Try to enhance with common patterns from source titles
        $commonWords = [];
        foreach ($sources as $source) {
            $words = str_word_count(strtolower($source['title']), 1);
            foreach ($words as $word) {
                if (strlen($word) > 3 && !in_array($word, ['the', 'and', 'for', 'with', 'that', 'this'])) {
                    $commonWords[] = $word;
                }
            }
        }

        $wordCounts = array_count_values($commonWords);
        arsort($wordCounts);
        $topWords = array_slice(array_keys($wordCounts), 0, 3);

        if (!empty($topWords)) {
            $title .= ': ' . ucwords(implode(' ', $topWords));
        }

        return $title;
    }

    /**
     * Search by manual URL input
     */
    public function searchByUrls(Request $request): JsonResponse
    {
        $request->validate([
            'urls' => 'required|array|max:10',
            'urls.*' => 'url'
        ]);

        $urls = $request->input('urls');

        try {
            $results = $this->scraperService->searchByUrls($urls);

            return response()->json([
                'success' => true,
                'results' => $results,
                'count' => count($results)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'URL search failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get formatted content for rich text editor
     */
    public function getFormattedContent(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->input('url');

        try {
            $result = $this->scraperService->getFormattedContentForEditor($url);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $result['error']
                ], 400);
            }

            return response()->json($result);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Content formatting failed: ' . $e->getMessage()
            ], 500);
        }
    }
}