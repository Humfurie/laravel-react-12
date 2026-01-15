<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogView;
use App\Models\Experience;
use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\RealEstateProject;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'dashboardData' => Cache::remember('admin:dashboard', 60, fn() => [
                'stats' => $this->getStats(),
                'actionItems' => $this->getActionItems(),
                'charts' => $this->getChartData(),
                'recentActivity' => $this->getRecentActivity(),
                'topContent' => $this->getTopContent(),
                'insights' => $this->getInsights(),
            ]),
        ]);
    }

    private function getStats(): array
    {
        // Calculate trends (comparing to previous period)
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Run all count queries in parallel using Concurrency
        [
            $currentBlogCount,
            $previousBlogCount,
            $totalPublishedBlogs,
            $currentPropertyCount,
            $previousPropertyCount,
            $currentGiveawayCount,
            $previousGiveawayCount,
            $currentInquiryCount,
            $previousInquiryCount,
            $totalNewInquiries,
        ] = Concurrency::run([
            fn() => Blog::where('status', 'published')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->count(),
            fn() => Blog::where('status', 'published')
                ->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])
                ->count(),
            fn() => Blog::where('status', 'published')->count(),
            fn() => Property::where('listing_status', 'available')->count(),
            fn() => Property::where('listing_status', 'available')
                ->where('created_at', '<', $thirtyDaysAgo)
                ->count(),
            fn() => Giveaway::where('status', 'active')->count(),
            fn() => Giveaway::where('status', 'active')
                ->where('created_at', '<', $thirtyDaysAgo)
                ->count(),
            fn() => Inquiry::where('status', 'new')
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->count(),
            fn() => Inquiry::where('status', 'new')
                ->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])
                ->count(),
            fn() => Inquiry::where('status', 'new')->count(),
        ]);

        return [
            'blogPosts' => [
                'count' => $totalPublishedBlogs,
                'trend' => $this->calculateTrend($currentBlogCount, $previousBlogCount),
            ],
            'properties' => [
                'count' => $currentPropertyCount,
                'trend' => $this->calculateTrend($currentPropertyCount, $previousPropertyCount),
            ],
            'giveaways' => [
                'count' => $currentGiveawayCount,
                'trend' => $this->calculateTrend($currentGiveawayCount, $previousGiveawayCount),
            ],
            'inquiries' => [
                'count' => $totalNewInquiries,
                'trend' => $this->calculateTrend($currentInquiryCount, $previousInquiryCount),
            ],
        ];
    }

    private function getActionItems(): array
    {
        $now = Carbon::now();
        $twoDaysAgo = $now->copy()->subDays(2);
        $fortyEightHoursFromNow = $now->copy()->addHours(48);

        // Run all action item counts in parallel
        [
            $inquiriesNeedingFollowUp,
            $giveawaysEndingSoon,
            $pendingScreenshots,
            $draftBlogs,
        ] = Concurrency::run([
            fn() => Inquiry::whereIn('status', ['new', 'in_progress'])
                ->where(function ($query) use ($twoDaysAgo) {
                    $query->whereNull('followed_up_at')
                        ->orWhere('followed_up_at', '<=', $twoDaysAgo);
                })
                ->count(),
            fn() => Giveaway::where('status', 'active')
                ->where('end_date', '<=', $fortyEightHoursFromNow)
                ->where('end_date', '>=', $now)
                ->count(),
            fn() => GiveawayEntry::where('status', 'pending')
                ->whereNotNull('screenshot_path')
                ->count(),
            fn() => Blog::where('status', 'draft')->count(),
        ]);

        return [
            'inquiriesNeedingFollowUp' => $inquiriesNeedingFollowUp,
            'giveawaysEndingSoon' => $giveawaysEndingSoon,
            'pendingScreenshots' => $pendingScreenshots,
            'draftBlogs' => $draftBlogs,
        ];
    }

    private function getChartData(): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        // Run chart data queries in parallel
        [$giveawayEntries, $propertiesByStatus] = Concurrency::run([
            fn() => GiveawayEntry::where('created_at', '>=', $thirtyDaysAgo)
                ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(fn($item) => [
                    'date' => $item->date,
                    'count' => $item->count,
                ])
                ->toArray(),
            fn() => Property::select('listing_status', DB::raw('COUNT(*) as count'))
                ->groupBy('listing_status')
                ->get()
                ->map(fn($item) => [
                    'status' => ucfirst(str_replace('_', ' ', $item->listing_status)),
                    'count' => $item->count,
                ])
                ->toArray(),
        ]);

        return [
            'giveawayEntries' => $this->fillMissingDates($giveawayEntries, 30),
            'propertiesByStatus' => $propertiesByStatus,
        ];
    }

    private function getRecentActivity(): array
    {
        // Run all recent activity queries in parallel
        [
            $recentEntries,
            $recentInquiries,
            $recentWinners,
            $recentBlogs,
        ] = Concurrency::run([
            fn() => GiveawayEntry::with(['giveaway'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($entry) => [
                    'type' => 'giveaway_entry',
                    'message' => "New entry for {$entry->giveaway->title}",
                    'time' => $entry->created_at->diffForHumans(),
                    'timestamp' => $entry->created_at->toIso8601String(),
                ]),
            fn() => Inquiry::with(['property'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($inquiry) => [
                    'type' => 'inquiry',
                    'message' => "New inquiry for {$inquiry->property->title}",
                    'time' => $inquiry->created_at->diffForHumans(),
                    'timestamp' => $inquiry->created_at->toIso8601String(),
                ]),
            fn() => GiveawayEntry::with(['giveaway'])
                ->where('status', 'winner')
                ->latest('updated_at')
                ->limit(5)
                ->get()
                ->map(fn($entry) => [
                    'type' => 'winner',
                    'message' => "Winner selected for {$entry->giveaway->title}",
                    'time' => $entry->updated_at->diffForHumans(),
                    'timestamp' => $entry->updated_at->toIso8601String(),
                ]),
            fn() => Blog::where('status', 'published')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn($blog) => [
                    'type' => 'blog',
                    'message' => "Published: {$blog->title}",
                    'time' => $blog->created_at->diffForHumans(),
                    'timestamp' => $blog->created_at->toIso8601String(),
                ]),
        ]);

        // Merge and sort by timestamp
        return collect([])
            ->merge($recentEntries)
            ->merge($recentInquiries)
            ->merge($recentWinners)
            ->merge($recentBlogs)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->toArray();
    }

    private function getTopContent(): array
    {
        // Get trending blog IDs (most viewed in last 30 days)
        $trendingBlogIds = BlogView::getMostViewedBlogIds(30, 5);

        // Get trending blogs with their recent views
        $trendingBlogs = [];
        if (!empty($trendingBlogIds)) {
            $blogs = Blog::published()
                ->whereIn('id', $trendingBlogIds)
                ->get(['id', 'title', 'view_count']);

            // Sort by the trending order and add recent views
            foreach ($trendingBlogIds as $blogId) {
                $blog = $blogs->firstWhere('id', $blogId);
                if ($blog) {
                    $trendingBlogs[] = [
                        'id' => $blog->id,
                        'title' => $blog->title,
                        'views' => BlogView::getViewsInLastDays($blog->id, 30),
                    ];
                }
            }
        }

        // If not enough trending blogs, fill with top all-time
        if (count($trendingBlogs) < 5) {
            $existingIds = array_column($trendingBlogs, 'id');
            $additionalBlogs = Blog::where('status', 'published')
                ->whereNotIn('id', $existingIds)
                ->orderBy('view_count', 'desc')
                ->limit(5 - count($trendingBlogs))
                ->get(['id', 'title', 'view_count'])
                ->map(fn($blog) => [
                    'id' => $blog->id,
                    'title' => $blog->title,
                    'views' => $blog->view_count ?? 0,
                ])
                ->toArray();

            $trendingBlogs = array_merge($trendingBlogs, $additionalBlogs);
        }

        return [
            'topBlogs' => $trendingBlogs,
            'topProperties' => Property::orderBy('view_count', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'view_count'])
                ->map(fn($property) => [
                    'id' => $property->id,
                    'name' => $property->title,
                    'views' => $property->view_count ?? 0,
                ])
                ->toArray(),
            'topGiveaways' => Giveaway::withCount('entries')
                ->orderBy('entries_count', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'entries_count'])
                ->map(fn($giveaway) => [
                    'id' => $giveaway->id,
                    'title' => $giveaway->title,
                    'entries' => $giveaway->entries_count,
                ])
                ->toArray(),
        ];
    }

    private function getInsights(): array
    {
        // Inquiries by type
        $inquiriesByType = Inquiry::select('inquiry_type', DB::raw('COUNT(*) as count'))
            ->groupBy('inquiry_type')
            ->get()
            ->map(fn($item) => [
                'type' => ucfirst(str_replace('_', ' ', $item->inquiry_type)),
                'count' => $item->count,
            ])
            ->toArray();

        // Count manually featured blogs (active featured)
        $featuredBlogsCount = Blog::published()->manuallyFeatured()->count();

        // Get total views in last 30 days
        $totalViewsLast30Days = BlogView::where('view_date', '>=', now()->subDays(30)->toDateString())
            ->sum('view_count');

        return [
            'inquiriesByType' => $inquiriesByType,
            'totalBlogs' => Blog::count(),
            'featuredBlogs' => $featuredBlogsCount,
            'totalViewsLast30Days' => (int)$totalViewsLast30Days,
            'totalExperiences' => Experience::count(),
            'totalProjects' => RealEstateProject::count(),
        ];
    }

    private function calculateTrend(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function fillMissingDates(array $data, int $days): array
    {
        $result = [];
        $dataByDate = collect($data)->keyBy('date');

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $result[] = [
                'date' => $date,
                'count' => $dataByDate->get($date)['count'] ?? 0,
            ];
        }

        return $result;
    }
}
