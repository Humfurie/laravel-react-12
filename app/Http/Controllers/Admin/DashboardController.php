<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\RealEstateProject;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'dashboardData' => [
                'stats' => $this->getStats(),
                'actionItems' => $this->getActionItems(),
                'charts' => $this->getChartData(),
                'recentActivity' => $this->getRecentActivity(),
                'topContent' => $this->getTopContent(),
                'insights' => $this->getInsights(),
            ],
        ]);
    }

    private function getStats(): array
    {
        // Calculate trends (comparing to previous period)
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Blog stats
        $currentBlogCount = Blog::where('status', 'published')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();
        $previousBlogCount = Blog::where('status', 'published')
            ->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])
            ->count();
        $blogTrend = $this->calculateTrend($currentBlogCount, $previousBlogCount);

        // Property stats
        $currentPropertyCount = Property::where('listing_status', 'available')->count();
        $previousPropertyCount = Property::where('listing_status', 'available')
            ->where('created_at', '<', $thirtyDaysAgo)
            ->count();
        $propertyTrend = $this->calculateTrend($currentPropertyCount, $previousPropertyCount);

        // Giveaway stats
        $currentGiveawayCount = Giveaway::where('status', 'active')->count();
        $previousGiveawayCount = Giveaway::where('status', 'active')
            ->where('created_at', '<', $thirtyDaysAgo)
            ->count();
        $giveawayTrend = $this->calculateTrend($currentGiveawayCount, $previousGiveawayCount);

        // Inquiry stats
        $currentInquiryCount = Inquiry::where('status', 'new')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->count();
        $previousInquiryCount = Inquiry::where('status', 'new')
            ->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])
            ->count();
        $inquiryTrend = $this->calculateTrend($currentInquiryCount, $previousInquiryCount);

        return [
            'blogPosts' => [
                'count' => Blog::where('status', 'published')->count(),
                'trend' => $blogTrend,
            ],
            'properties' => [
                'count' => $currentPropertyCount,
                'trend' => $propertyTrend,
            ],
            'giveaways' => [
                'count' => $currentGiveawayCount,
                'trend' => $giveawayTrend,
            ],
            'inquiries' => [
                'count' => Inquiry::where('status', 'new')->count(),
                'trend' => $inquiryTrend,
            ],
        ];
    }

    private function getActionItems(): array
    {
        $now = Carbon::now();
        $twoDaysAgo = $now->copy()->subDays(2);

        return [
            'inquiriesNeedingFollowUp' => Inquiry::whereIn('status', ['new', 'in_progress'])
                ->where(function ($query) use ($twoDaysAgo) {
                    $query->whereNull('followed_up_at')
                        ->orWhere('followed_up_at', '<=', $twoDaysAgo);
                })
                ->count(),
            'giveawaysEndingSoon' => Giveaway::where('status', 'active')
                ->where('end_date', '<=', $now->copy()->addHours(48))
                ->where('end_date', '>=', $now)
                ->count(),
            'pendingScreenshots' => GiveawayEntry::where('status', 'pending')
                ->whereNotNull('screenshot_path')
                ->count(),
            'draftBlogs' => Blog::where('status', 'draft')->count(),
        ];
    }

    private function getChartData(): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        // Giveaway entries over last 30 days
        $giveawayEntries = GiveawayEntry::where('created_at', '>=', $thirtyDaysAgo)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date,
                'count' => $item->count,
            ])
            ->toArray();

        // Fill in missing dates with zero counts
        $filledEntries = $this->fillMissingDates($giveawayEntries, 30);

        // Properties by status
        $propertiesByStatus = Property::select('listing_status', DB::raw('COUNT(*) as count'))
            ->groupBy('listing_status')
            ->get()
            ->map(fn($item) => [
                'status' => ucfirst(str_replace('_', ' ', $item->listing_status)),
                'count' => $item->count,
            ])
            ->toArray();

        return [
            'giveawayEntries' => $filledEntries,
            'propertiesByStatus' => $propertiesByStatus,
        ];
    }

    private function getRecentActivity(): array
    {
        $activities = [];

        // Recent giveaway entries
        $recentEntries = GiveawayEntry::with(['giveaway'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($entry) => [
                'type' => 'giveaway_entry',
                'message' => "New entry for {$entry->giveaway->title}",
                'time' => $entry->created_at->diffForHumans(),
                'timestamp' => $entry->created_at->toIso8601String(),
            ]);

        // Recent inquiries
        $recentInquiries = Inquiry::with(['property'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($inquiry) => [
                'type' => 'inquiry',
                'message' => "New inquiry for {$inquiry->property->title}",
                'time' => $inquiry->created_at->diffForHumans(),
                'timestamp' => $inquiry->created_at->toIso8601String(),
            ]);

        // Recent winners
        $recentWinners = GiveawayEntry::with(['giveaway'])
            ->where('status', 'winner')
            ->latest('updated_at')
            ->limit(5)
            ->get()
            ->map(fn($entry) => [
                'type' => 'winner',
                'message' => "Winner selected for {$entry->giveaway->title}",
                'time' => $entry->updated_at->diffForHumans(),
                'timestamp' => $entry->updated_at->toIso8601String(),
            ]);

        // Recent blog posts
        $recentBlogs = Blog::where('status', 'published')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($blog) => [
                'type' => 'blog',
                'message' => "Published: {$blog->title}",
                'time' => $blog->created_at->diffForHumans(),
                'timestamp' => $blog->created_at->toIso8601String(),
            ]);

        // Merge and sort by timestamp
        $activities = collect([])
            ->merge($recentEntries)
            ->merge($recentInquiries)
            ->merge($recentWinners)
            ->merge($recentBlogs)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values()
            ->toArray();

        return $activities;
    }

    private function getTopContent(): array
    {
        return [
            'topBlogs' => Blog::where('status', 'published')
                ->orderBy('view_count', 'desc')
                ->limit(5)
                ->get(['id', 'title', 'view_count'])
                ->map(fn($blog) => [
                    'id' => $blog->id,
                    'title' => $blog->title,
                    'views' => $blog->view_count ?? 0,
                ])
                ->toArray(),
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

        return [
            'inquiriesByType' => $inquiriesByType,
            'totalBlogs' => Blog::count(),
            'totalExperiences' => \App\Models\Experience::count(),
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
