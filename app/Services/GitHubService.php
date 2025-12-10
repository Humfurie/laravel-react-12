<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GitHubService
{
    protected string $baseUrl = 'https://api.github.com';
    protected ?string $token;

    public function __construct()
    {
        $this->token = config('services.github.token');
    }

    /**
     * Get contributor count for a repository.
     *
     * @param string $repo Repository in "owner/repo" format
     * @return int
     */
    public function getContributorCount(string $repo): int
    {
        $cacheKey = "github_contributors_{$repo}";

        return Cache::remember($cacheKey, 3600, function () use ($repo) {
            try {
                $response = $this->makeRequest("/repos/{$repo}/contributors?per_page=1&anon=true", true);

                // GitHub returns contributor count in Link header
                return $response ?? 0;
            } catch (Exception $e) {
                Log::error("GitHub API error getting contributors for {$repo}: " . $e->getMessage());
                return 0;
            }
        });
    }

    /**
     * Make a request to the GitHub API.
     *
     * @param string $endpoint
     * @param bool $returnCount Return count from Link header instead of body
     * @return array|int|null
     */
    protected function makeRequest(string $endpoint, bool $returnCount = false): array|int|null
    {
        $request = Http::withHeaders([
            'Accept' => 'application/vnd.github.v3+json',
            'User-Agent' => config('app.name', 'Laravel'),
        ]);

        if ($this->token) {
            $request->withToken($this->token);
        }

        $response = $request->get($this->baseUrl . $endpoint);

        if (!$response->successful()) {
            Log::warning("GitHub API request failed: {$endpoint}", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return null;
        }

        if ($returnCount) {
            // Parse Link header for total count
            $linkHeader = $response->header('Link');
            if ($linkHeader && preg_match('/page=(\d+)>; rel="last"/', $linkHeader, $matches)) {
                return (int)$matches[1];
            }
            return count($response->json()) ?: 0;
        }

        return $response->json();
    }

    /**
     * Get all metrics for a repository.
     *
     * @param string $repo Repository in "owner/repo" format
     * @return array|null
     */
    public function getAllMetrics(string $repo): ?array
    {
        $stats = $this->getRepoStats($repo);

        if (!$stats) {
            return null;
        }

        $downloads = $this->getDownloadCount($repo);

        return [
            'stars' => $stats['stars'],
            'forks' => $stats['forks'],
            'watchers' => $stats['watchers'],
            'downloads' => $downloads,
            'open_issues' => $stats['open_issues'],
            'language' => $stats['language'],
            'topics' => $stats['topics'],
            'license' => $stats['license'],
            'last_push' => $stats['pushed_at'],
        ];
    }

    /**
     * Get repository statistics from GitHub.
     *
     * @param string $repo Repository in "owner/repo" format
     * @return array|null
     */
    public function getRepoStats(string $repo): ?array
    {
        $cacheKey = "github_stats_{$repo}";

        // Cache for 1 hour to avoid rate limiting
        return Cache::remember($cacheKey, 3600, function () use ($repo) {
            try {
                $response = $this->makeRequest("/repos/{$repo}");

                if (!$response) {
                    return null;
                }

                return [
                    'stars' => $response['stargazers_count'] ?? 0,
                    'forks' => $response['forks_count'] ?? 0,
                    'watchers' => $response['watchers_count'] ?? 0,
                    'open_issues' => $response['open_issues_count'] ?? 0,
                    'language' => $response['language'] ?? null,
                    'description' => $response['description'] ?? null,
                    'topics' => $response['topics'] ?? [],
                    'license' => $response['license']['spdx_id'] ?? null,
                    'created_at' => $response['created_at'] ?? null,
                    'updated_at' => $response['updated_at'] ?? null,
                    'pushed_at' => $response['pushed_at'] ?? null,
                ];
            } catch (Exception $e) {
                Log::error("GitHub API error for {$repo}: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Get repository download/release statistics.
     *
     * @param string $repo Repository in "owner/repo" format
     * @return int Total downloads across all releases
     */
    public function getDownloadCount(string $repo): int
    {
        $cacheKey = "github_downloads_{$repo}";

        return Cache::remember($cacheKey, 3600, function () use ($repo) {
            try {
                $response = $this->makeRequest("/repos/{$repo}/releases");

                if (!$response || !is_array($response)) {
                    return 0;
                }

                $totalDownloads = 0;
                foreach ($response as $release) {
                    foreach ($release['assets'] ?? [] as $asset) {
                        $totalDownloads += $asset['download_count'] ?? 0;
                    }
                }

                return $totalDownloads;
            } catch (Exception $e) {
                Log::error("GitHub API error getting downloads for {$repo}: " . $e->getMessage());
                return 0;
            }
        });
    }

    /**
     * Clear cached data for a repository.
     *
     * @param string $repo
     * @return void
     */
    public function clearCache(string $repo): void
    {
        Cache::forget("github_stats_{$repo}");
        Cache::forget("github_downloads_{$repo}");
        Cache::forget("github_contributors_{$repo}");
    }
}
