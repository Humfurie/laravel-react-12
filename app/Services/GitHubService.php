<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GitHubService
{
    protected string $baseUrl = 'https://api.github.com';

    protected string $graphqlUrl = 'https://api.github.com/graphql';

    protected ?string $token;

    public function __construct()
    {
        $this->token = config('services.github.token');
    }

    /**
     * Get contributor count for a repository.
     *
     * @param string $repo Repository in "owner/repo" format
     */
    public function getContributorCount(string $repo): int
    {
        $cacheKey = "github_contributors_count_{$repo}";

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
     * Get contributors for a repository with full details.
     *
     * @param string $repo Repository in "owner/repo" format
     * @param int $limit Maximum number of contributors to return
     * @return array<int, array{login: string|null, id: int|null, avatar_url: string|null, profile_url: string|null, contributions: int, type: string}>
     */
    public function getContributors(string $repo, int $limit = 10): array
    {
        $cacheKey = "github_contributors_{$repo}_{$limit}";

        return Cache::remember($cacheKey, 3600, function () use ($repo, $limit) {
            try {
                $response = $this->makeRequest("/repos/{$repo}/contributors?per_page={$limit}");

                if (!$response || !is_array($response)) {
                    return [];
                }

                return array_map(function ($contributor) {
                    return [
                        'login' => $contributor['login'] ?? null,
                        'id' => $contributor['id'] ?? null,
                        'avatar_url' => $contributor['avatar_url'] ?? null,
                        'profile_url' => $contributor['html_url'] ?? null,
                        'contributions' => $contributor['contributions'] ?? 0,
                        'type' => $contributor['type'] ?? 'User',
                    ];
                }, $response);
            } catch (Exception $e) {
                Log::error("GitHub API error getting contributors for {$repo}: " . $e->getMessage());

                return [];
            }
        });
    }

    /**
     * Make a request to the GitHub API.
     *
     * @param bool $returnCount Return count from Link header instead of body
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
     * @param int $contributorLimit Maximum number of contributors to include
     * @return array{stars: int, forks: int, watchers: int, downloads: int, open_issues: int, language: string|null, topics: array<int, string>, license: string|null, last_push: string|null, contributors: array<int, array{login: string|null, id: int|null, avatar_url: string|null, profile_url: string|null, contributions: int, type: string}>, contributor_count: int, contribution_calendar: array{calendar: array<mixed>, total_contributions: int}|null}|null
     */
    public function getAllMetrics(string $repo, int $contributorLimit = 10): ?array
    {
        $stats = $this->getRepoStats($repo);

        if (!$stats) {
            return null;
        }

        $downloads = $this->getDownloadCount($repo);
        $contributors = $this->getContributors($repo, $contributorLimit);

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
            'contributors' => $contributors,
            'contributor_count' => count($contributors),
            'contribution_calendar' => $this->getRepoOwnerContributions($repo),
        ];
    }

    /**
     * Get repository owner's contribution calendar.
     *
     * @param string $repo Repository in "owner/repo" format
     * @return array{calendar: array<mixed>, total_contributions: int}|null
     */
    public function getRepoOwnerContributions(string $repo): ?array
    {
        [$owner] = explode('/', $repo, 2);
        $contributions = $this->getUserContributions($owner);

        if (!$contributions) {
            return null;
        }

        return [
            'calendar' => $contributions['calendar'],
            'total_contributions' => $contributions['total_contributions'],
        ];
    }

    /**
     * Get repository statistics from GitHub.
     *
     * @param string $repo Repository in "owner/repo" format
     * @return array{stars: int, forks: int, watchers: int, open_issues: int, language: string|null, description: string|null, topics: array<int, string>, license: string|null, created_at: string|null, updated_at: string|null, pushed_at: string|null}|null
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
     */
    public function clearCache(string $repo): void
    {
        Cache::forget("github_stats_{$repo}");
        Cache::forget("github_downloads_{$repo}");
        Cache::forget("github_contributors_count_{$repo}");

        // Clear contributor caches for common limits
        foreach ([5, 10, 20, 50] as $limit) {
            Cache::forget("github_contributors_{$repo}_{$limit}");
        }
    }

    /**
     * Get user's GitHub contribution data via GraphQL API.
     *
     * @param string $username GitHub username
     * @return array{total_contributions: int, commits: int, pull_requests: int, issues: int, reviews: int, private_contributions: int, calendar: array<mixed>, top_repositories: array<int, array{name: string, stars: int, forks: int, language: string|null, language_color: string|null}>}|null
     */
    public function getUserContributions(string $username): ?array
    {
        if (!$this->token) {
            Log::warning('GitHub token not configured, cannot fetch user contributions');

            return null;
        }

        $cacheKey = "github_user_contributions_{$username}";

        return Cache::remember($cacheKey, 86400, function () use ($username) {
            try {
                $query = <<<'GRAPHQL'
                query($username: String!) {
                    user(login: $username) {
                        contributionsCollection {
                            totalCommitContributions
                            totalPullRequestContributions
                            totalIssueContributions
                            totalPullRequestReviewContributions
                            restrictedContributionsCount
                            contributionCalendar {
                                totalContributions
                                weeks {
                                    contributionDays {
                                        contributionCount
                                        date
                                        color
                                    }
                                }
                            }
                        }
                        repositories(first: 5, orderBy: {field: STARGAZERS, direction: DESC}, ownerAffiliations: OWNER) {
                            nodes {
                                name
                                stargazerCount
                                forkCount
                                primaryLanguage {
                                    name
                                    color
                                }
                            }
                        }
                    }
                }
                GRAPHQL;

                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$this->token}",
                    'Content-Type' => 'application/json',
                ])->post($this->graphqlUrl, [
                    'query' => $query,
                    'variables' => ['username' => $username],
                ]);

                if (!$response->successful()) {
                    Log::warning("GitHub GraphQL request failed for user {$username}", [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);

                    return null;
                }

                $data = $response->json();

                if (isset($data['errors'])) {
                    Log::warning("GitHub GraphQL errors for user {$username}", [
                        'errors' => $data['errors'],
                    ]);

                    return null;
                }

                $user = $data['data']['user'] ?? null;

                if (!$user) {
                    return null;
                }

                $contributions = $user['contributionsCollection'];
                $calendar = $contributions['contributionCalendar'];

                return [
                    'total_contributions' => $calendar['totalContributions'],
                    'commits' => $contributions['totalCommitContributions'],
                    'pull_requests' => $contributions['totalPullRequestContributions'],
                    'issues' => $contributions['totalIssueContributions'],
                    'reviews' => $contributions['totalPullRequestReviewContributions'],
                    'private_contributions' => $contributions['restrictedContributionsCount'],
                    'calendar' => $calendar['weeks'],
                    'top_repositories' => array_map(function ($repo) {
                        return [
                            'name' => $repo['name'],
                            'stars' => $repo['stargazerCount'],
                            'forks' => $repo['forkCount'],
                            'language' => $repo['primaryLanguage']['name'] ?? null,
                            'language_color' => $repo['primaryLanguage']['color'] ?? null,
                        ];
                    }, $user['repositories']['nodes'] ?? []),
                ];
            } catch (Exception $e) {
                Log::error("GitHub GraphQL error for user {$username}: " . $e->getMessage());

                return null;
            }
        });
    }

    /**
     * Clear cached contribution data for a user.
     */
    public function clearUserContributionsCache(string $username): void
    {
        Cache::forget("github_user_contributions_{$username}");
    }
}
