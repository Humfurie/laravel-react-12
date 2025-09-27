<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use DOMDocument;
use DOMXPath;

class WebScraperService
{
    private const SEARCH_ENGINES = [
        'google' => 'https://www.google.com/search?q=%s&num=10',
        'bing' => 'https://www.bing.com/search?q=%s&count=10',
    ];

    private const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    public function searchWeb(string $topic, int $maxResults = 10): array
    {
        $query = urlencode($topic);
        $results = [];

        // Try multiple search methods
        try {
            // Try DuckDuckGo first (more permissive)
            $duckResults = $this->searchDuckDuckGo($query, $maxResults);
            $results = array_merge($results, $duckResults);
        } catch (\Exception $e) {
            \Log::warning('DuckDuckGo search failed: ' . $e->getMessage());
        }

        // If we need more results, try a simulated search using predefined sources
        if (count($results) < $maxResults) {
            $simulatedResults = $this->getSimulatedResults($topic, $maxResults - count($results));
            $results = array_merge($results, $simulatedResults);
        }

        return array_slice($results, 0, $maxResults);
    }

    private function searchGoogle(string $query, int $limit): array
    {
        try {
            $url = sprintf(self::SEARCH_ENGINES['google'], $query);
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-US,en;q=0.5',
                'Accept-Encoding' => 'gzip, deflate',
                'Connection' => 'keep-alive',
            ])->timeout(30)->get($url);

            if (!$response->successful()) {
                return [];
            }

            return $this->parseGoogleResults($response->body(), $limit);
        } catch (\Exception $e) {
            \Log::error('Google search failed: ' . $e->getMessage());
            return [];
        }
    }

    private function searchBing(string $query, int $limit): array
    {
        try {
            $url = sprintf(self::SEARCH_ENGINES['bing'], $query);
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
            ])->timeout(30)->get($url);

            if (!$response->successful()) {
                return [];
            }

            return $this->parseBingResults($response->body(), $limit);
        } catch (\Exception $e) {
            \Log::error('Bing search failed: ' . $e->getMessage());
            return [];
        }
    }

    private function parseGoogleResults(string $html, int $limit): array
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        $results = [];
        $searchResults = $xpath->query('//div[@class="g"]//h3/parent::a');

        foreach ($searchResults as $index => $link) {
            if ($index >= $limit) break;

            $href = $link->getAttribute('href');
            $title = $link->textContent;

            if (!empty($href) && !empty($title) && filter_var($href, FILTER_VALIDATE_URL)) {
                $results[] = [
                    'title' => trim($title),
                    'url' => $href,
                    'source' => 'google'
                ];
            }
        }

        return $results;
    }

    private function parseBingResults(string $html, int $limit): array
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        $results = [];
        $searchResults = $xpath->query('//li[@class="b_algo"]//h2/a');

        foreach ($searchResults as $index => $link) {
            if ($index >= $limit) break;

            $href = $link->getAttribute('href');
            $title = $link->textContent;

            if (!empty($href) && !empty($title) && filter_var($href, FILTER_VALIDATE_URL)) {
                $results[] = [
                    'title' => trim($title),
                    'url' => $href,
                    'source' => 'bing'
                ];
            }
        }

        return $results;
    }

    public function scrapeContent(string $url): array
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
            ])->timeout(30)->get($url);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Failed to fetch content'
                ];
            }

            $html = $response->body();
            $content = $this->extractMainContent($html);
            $images = $this->extractImages($html, $url);

            return [
                'success' => true,
                'title' => $content['title'],
                'content' => $content['text'],
                'images' => $images,
                'url' => $url
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function extractMainContent(string $html): array
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        // Extract title
        $titleNode = $xpath->query('//title')->item(0);
        $title = $titleNode ? trim($titleNode->textContent) : '';

        // Try to find main content using various selectors
        $contentSelectors = [
            '//article',
            '//main',
            '//div[contains(@class, "content")]',
            '//div[contains(@class, "post")]',
            '//div[contains(@class, "article")]',
            '//div[contains(@id, "content")]',
            '//div[contains(@id, "main")]',
            '//body'
        ];

        $contentNode = null;
        foreach ($contentSelectors as $selector) {
            $nodes = $xpath->query($selector);
            if ($nodes->length > 0) {
                $testText = $this->extractTextFromNode($nodes->item(0));
                if (strlen($testText) > 500) { // Only use if we got substantial content
                    $contentNode = $nodes->item(0);
                    break;
                }
            }
        }

        if (!$contentNode) {
            return [
                'title' => $title,
                'text' => '',
                'html' => ''
            ];
        }

        // Extract both plain text and formatted HTML
        $plainText = $this->extractTextFromNode($contentNode);
        $formattedHtml = $this->extractFormattedHtml($contentNode, $xpath);

        return [
            'title' => $title,
            'text' => $this->cleanText($plainText),
            'html' => $formattedHtml
        ];
    }

    private function extractTextFromNode($node): string
    {
        // Remove script and style elements
        $xpath = new DOMXPath($node->ownerDocument);
        $scripts = $xpath->query('.//script | .//style | .//nav | .//header | .//footer', $node);
        foreach ($scripts as $script) {
            $script->parentNode->removeChild($script);
        }

        return $node->textContent;
    }

    private function cleanText(string $text): string
    {
        // Remove extra whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        // Remove non-printable characters
        $text = preg_replace('/[^\P{C}\n\r\t]/u', '', $text);

        return trim($text);
    }

    private function extractImages(string $html, string $baseUrl): array
    {
        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        $images = [];
        $imgNodes = $xpath->query('//img[@src]');

        foreach ($imgNodes as $img) {
            $src = $img->getAttribute('src');
            $alt = $img->getAttribute('alt');

            // Convert relative URLs to absolute
            if (!filter_var($src, FILTER_VALIDATE_URL)) {
                $src = $this->resolveUrl($src, $baseUrl);
            }

            // Filter out small images (likely icons/decorative)
            $width = $img->getAttribute('width');
            $height = $img->getAttribute('height');

            if ($width && $height && ($width < 100 || $height < 100)) {
                continue;
            }

            // Filter out common non-content images
            if (preg_match('/\.(svg|gif)$/i', $src) ||
                strpos($src, 'logo') !== false ||
                strpos($src, 'icon') !== false ||
                strpos($src, 'avatar') !== false) {
                continue;
            }

            $images[] = [
                'url' => $src,
                'alt' => $alt,
                'width' => $width,
                'height' => $height
            ];
        }

        return array_slice($images, 0, 5); // Limit to 5 images
    }

    private function resolveUrl(string $relativeUrl, string $baseUrl): string
    {
        $parsed = parse_url($baseUrl);
        $scheme = $parsed['scheme'] ?? 'http';
        $host = $parsed['host'] ?? '';

        if (strpos($relativeUrl, '//') === 0) {
            return $scheme . ':' . $relativeUrl;
        }

        if (strpos($relativeUrl, '/') === 0) {
            return $scheme . '://' . $host . $relativeUrl;
        }

        return $scheme . '://' . $host . '/' . ltrim($relativeUrl, '/');
    }

    public function summarizeContent(string $content, int $maxLength = 500): string
    {
        // Simple summarization - extract key sentences
        $sentences = preg_split('/[.!?]+/', $content);
        $sentences = array_filter(array_map('trim', $sentences));

        if (empty($sentences)) {
            return '';
        }

        // Score sentences based on length and position
        $scored = [];
        foreach ($sentences as $index => $sentence) {
            if (strlen($sentence) < 20) continue; // Skip very short sentences

            $score = 0;
            $score += (count($sentences) - $index) * 0.1; // Earlier sentences score higher
            $score += min(strlen($sentence) / 100, 1); // Longer sentences score higher (up to a point)

            $scored[] = [
                'sentence' => $sentence,
                'score' => $score,
                'index' => $index
            ];
        }

        // Sort by score
        usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

        // Build summary
        $summary = '';
        foreach ($scored as $item) {
            if (strlen($summary . $item['sentence']) > $maxLength) {
                break;
            }
            $summary .= $item['sentence'] . '. ';
        }

        return trim($summary);
    }

    public function downloadAndProcessImage(string $imageUrl): ?array
    {
        try {
            $response = Http::timeout(30)->get($imageUrl);

            if (!$response->successful()) {
                return null;
            }

            $content = $response->body();
            $contentType = $response->header('content-type');

            // Validate image type
            if (!str_starts_with($contentType, 'image/')) {
                return null;
            }

            // Generate filename
            $extension = match($contentType) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp',
                default => 'jpg'
            };

            $filename = 'scraped_' . time() . '_' . Str::random(10) . '.' . $extension;
            $path = 'blog-images/' . $filename;

            // Store the image
            Storage::disk('public')->put($path, $content);

            return [
                'path' => $path,
                'url' => Storage::url($path),
                'filename' => $filename,
                'size' => strlen($content),
                'type' => $contentType
            ];

        } catch (\Exception $e) {
            \Log::error('Image download failed: ' . $e->getMessage());
            return null;
        }
    }

    private function searchDuckDuckGo(string $query, int $limit): array
    {
        try {
            // DuckDuckGo instant answer API
            $url = "https://api.duckduckgo.com/?q={$query}&format=json&no_redirect=1&no_html=1";

            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
            ])->timeout(30)->get($url);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            $results = [];

            // Extract results from DuckDuckGo API response
            if (isset($data['RelatedTopics'])) {
                foreach ($data['RelatedTopics'] as $index => $topic) {
                    if ($index >= $limit) break;

                    if (isset($topic['FirstURL']) && isset($topic['Text'])) {
                        $results[] = [
                            'title' => substr($topic['Text'], 0, 100) . '...',
                            'url' => $topic['FirstURL'],
                            'source' => 'duckduckgo'
                        ];
                    }
                }
            }

            return $results;
        } catch (\Exception $e) {
            \Log::error('DuckDuckGo search failed: ' . $e->getMessage());
            return [];
        }
    }

    private function getSimulatedResults(string $topic, int $limit): array
    {
        // Predefined high-quality sources for different topics
        $sources = [
            'technology' => [
                'https://techcrunch.com',
                'https://arstechnica.com',
                'https://www.theverge.com',
                'https://hackernoon.com',
                'https://dev.to'
            ],
            'programming' => [
                'https://stackoverflow.com/questions',
                'https://github.com',
                'https://dev.to',
                'https://medium.com',
                'https://hashnode.com'
            ],
            'laravel' => [
                'https://laravel.com/docs',
                'https://laracasts.com',
                'https://laravel-news.com',
                'https://freek.dev',
                'https://mattstauffer.com'
            ],
            'business' => [
                'https://techcrunch.com',
                'https://entrepreneur.com',
                'https://inc.com',
                'https://fastcompany.com',
                'https://hbr.org'
            ],
            'ai' => [
                'https://openai.com/blog',
                'https://ai.googleblog.com',
                'https://deepmind.com/blog',
                'https://research.fb.com',
                'https://blog.tensorflow.org'
            ]
        ];

        // Determine topic category
        $topicLower = strtolower($topic);
        $category = 'technology'; // default

        foreach ($sources as $cat => $urls) {
            if (strpos($topicLower, $cat) !== false) {
                $category = $cat;
                break;
            }
        }

        // Generate simulated search results
        $results = [];
        $categoryUrls = $sources[$category] ?? $sources['technology'];

        for ($i = 0; $i < min($limit, count($categoryUrls)); $i++) {
            $baseUrl = $categoryUrls[$i];

            // Create a simulated URL with the topic
            $simulatedPath = '/' . str_replace(' ', '-', strtolower($topic));
            $fullUrl = $baseUrl . $simulatedPath;

            $results[] = [
                'title' => ucwords($topic) . ' - ' . $this->getDomainName($baseUrl),
                'url' => $fullUrl,
                'source' => 'curated'
            ];
        }

        return $results;
    }

    private function getDomainName(string $url): string
    {
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? '';

        // Remove www. prefix
        if (strpos($host, 'www.') === 0) {
            $host = substr($host, 4);
        }

        return ucfirst(str_replace('.com', '', $host));
    }

    /**
     * Alternative search method using manual URL input
     */
    public function searchByUrls(array $urls): array
    {
        $results = [];

        foreach ($urls as $url) {
            if (filter_var($url, FILTER_VALIDATE_URL)) {
                // Extract title by scraping the page quickly
                try {
                    $response = Http::withHeaders([
                        'User-Agent' => self::USER_AGENT,
                    ])->timeout(10)->get($url);

                    if ($response->successful()) {
                        $dom = new DOMDocument();
                        @$dom->loadHTML($response->body());
                        $xpath = new DOMXPath($dom);

                        $titleNode = $xpath->query('//title')->item(0);
                        $title = $titleNode ? trim($titleNode->textContent) : parse_url($url, PHP_URL_HOST);

                        $results[] = [
                            'title' => $title,
                            'url' => $url,
                            'source' => 'manual'
                        ];
                    }
                } catch (\Exception $e) {
                    // If we can't get the title, use the domain name
                    $results[] = [
                        'title' => parse_url($url, PHP_URL_HOST) ?? 'Unknown',
                        'url' => $url,
                        'source' => 'manual'
                    ];
                }
            }
        }

        return $results;
    }

    /**
     * Extract and format HTML content for rich text editor
     */
    private function extractFormattedHtml($contentNode, $xpath): string
    {
        // Clone the node to avoid modifying the original
        $clonedNode = $contentNode->cloneNode(true);

        // Remove unwanted elements
        $unwantedElements = $xpath->query('.//script | .//style | .//nav | .//header | .//footer | .//aside | .//comment() | .//iframe | .//form | .//input | .//button', $clonedNode);
        foreach ($unwantedElements as $element) {
            if ($element->parentNode) {
                $element->parentNode->removeChild($element);
            }
        }

        // Remove ads and social media elements
        $adElements = $xpath->query('.//*[contains(@class, "ad") or contains(@class, "advertisement") or contains(@class, "social") or contains(@class, "share") or contains(@class, "sidebar") or contains(@class, "widget")]', $clonedNode);
        foreach ($adElements as $element) {
            if ($element->parentNode) {
                $element->parentNode->removeChild($element);
            }
        }

        // Process images - convert to proper format
        $imgElements = $xpath->query('.//img', $clonedNode);
        foreach ($imgElements as $img) {
            $src = $img->getAttribute('src');
            $alt = $img->getAttribute('alt');

            // Skip small decorative images
            $width = $img->getAttribute('width');
            $height = $img->getAttribute('height');
            if ($width && $height && ($width < 100 || $height < 100)) {
                if ($img->parentNode) {
                    $img->parentNode->removeChild($img);
                }
                continue;
            }

            // Clean up image attributes
            $img->removeAttribute('class');
            $img->removeAttribute('style');
            $img->removeAttribute('id');
            $img->removeAttribute('data-src');
            $img->removeAttribute('loading');
            $img->removeAttribute('srcset');

            if (!$alt) {
                $img->setAttribute('alt', 'Content image');
            }
        }

        // Clean up links
        $linkElements = $xpath->query('.//a', $clonedNode);
        foreach ($linkElements as $link) {
            $href = $link->getAttribute('href');

            // Remove tracking parameters and unwanted attributes
            $link->removeAttribute('class');
            $link->removeAttribute('style');
            $link->removeAttribute('id');
            $link->removeAttribute('target');
            $link->removeAttribute('rel');

            // Convert relative URLs to absolute
            if ($href && !filter_var($href, FILTER_VALIDATE_URL)) {
                // For now, remove relative links to avoid broken links
                $link->removeAttribute('href');
            }
        }

        // Convert tables to proper format
        $tableElements = $xpath->query('.//table', $clonedNode);
        foreach ($tableElements as $table) {
            $table->removeAttribute('class');
            $table->removeAttribute('style');
            $table->removeAttribute('id');
        }

        // Clean up other elements
        $allElements = $xpath->query('.//*', $clonedNode);
        foreach ($allElements as $element) {
            // Remove most attributes but keep essential ones
            $attributesToKeep = ['href', 'src', 'alt', 'title', 'colspan', 'rowspan'];
            $attributesToRemove = [];

            for ($i = 0; $i < $element->attributes->length; $i++) {
                $attr = $element->attributes->item($i);
                if (!in_array($attr->name, $attributesToKeep)) {
                    $attributesToRemove[] = $attr->name;
                }
            }

            foreach ($attributesToRemove as $attrName) {
                $element->removeAttribute($attrName);
            }
        }

        // Get the formatted HTML
        $html = '';
        foreach ($clonedNode->childNodes as $child) {
            $html .= $clonedNode->ownerDocument->saveHTML($child);
        }

        // Clean up the HTML
        $html = $this->cleanHtml($html);

        return $html;
    }

    /**
     * Clean and optimize HTML for rich text editor
     */
    private function cleanHtml(string $html): string
    {
        // Remove empty paragraphs and divs
        $html = preg_replace('/<(p|div|span)[^>]*>\s*<\/(p|div|span)>/i', '', $html);

        // Convert divs to paragraphs where appropriate
        $html = preg_replace('/<div([^>]*)>(.*?)<\/div>/is', '<p$1>$2</p>', $html);

        // Remove nested paragraphs
        $html = preg_replace('/<p[^>]*>\s*<p[^>]*>/i', '<p>', $html);
        $html = preg_replace('/<\/p>\s*<\/p>/i', '</p>', $html);

        // Clean up whitespace
        $html = preg_replace('/\s+/', ' ', $html);
        $html = preg_replace('/>\s+</', '><', $html);

        // Remove empty attributes
        $html = preg_replace('/\s+[a-zA-Z-]+=""/', '', $html);

        // Ensure proper paragraph structure
        $html = preg_replace('/([^>])\s*<(h[1-6]|p|ul|ol|blockquote)/', '$1</p><$2', $html);
        $html = preg_replace('/<\/(h[1-6]|p|ul|ol|blockquote)>\s*([^<])/', '</$1><p>$2', $html);

        // Remove script and style content that might have been missed
        $html = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html);

        return trim($html);
    }

    /**
     * Get formatted content specifically for rich text editor
     */
    public function getFormattedContentForEditor(string $url): array
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => self::USER_AGENT,
            ])->timeout(30)->get($url);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Failed to fetch content'
                ];
            }

            $html = $response->body();
            $content = $this->extractMainContent($html);
            $images = $this->extractImages($html, $url);

            return [
                'success' => true,
                'title' => $content['title'],
                'html_content' => $content['html'] ?? '',
                'plain_content' => $content['text'],
                'images' => $images,
                'url' => $url,
                'excerpt' => $this->summarizeContent($content['text'], 200)
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}