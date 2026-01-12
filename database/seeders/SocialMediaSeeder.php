<?php

namespace Database\Seeders;

use App\Models\SocialAccount;
use App\Models\SocialMetric;
use App\Models\SocialPost;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Social Media Test Data Seeder
 *
 * Creates comprehensive test data for the social media management dashboard:
 * - Multiple accounts per platform (YouTube, Facebook, Instagram, TikTok, Threads)
 * - Posts with various statuses (draft, scheduled, published, failed)
 * - Metrics and analytics data
 * - Realistic timestamps and engagement numbers
 */
class SocialMediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (or create one if none exists)
        $user = User::first();

        if (!$user) {
            $this->command->error('No users found. Please create a user first.');

            return;
        }

        $this->command->info("Creating test data for user: {$user->email}");

        // Create social accounts for each platform
        $accounts = $this->createSocialAccounts($user);

        // Create posts for each account
        $posts = $this->createPosts($accounts);

        // Create metrics for published posts
        $this->createMetrics($posts);

        $this->command->info('✓ Social media test data created successfully!');
        $this->command->info("  - {$accounts->count()} social accounts");
        $this->command->info("  - {$posts->count()} posts");
        $this->command->info('  - Metrics data generated');
    }

    /**
     * Create social accounts for all platforms.
     */
    protected function createSocialAccounts(User $user)
    {
        $this->command->info('Creating social accounts...');

        $accounts = collect();

        // YouTube accounts
        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'youtube',
            'platform_user_id' => 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
            'username' => 'TechReviews',
            'name' => 'Tech Reviews Channel',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Tech+Reviews&background=FF0000&color=fff',
            'access_token' => encrypt('test_youtube_access_token_1'),
            'refresh_token' => encrypt('test_youtube_refresh_token_1'),
            'token_expires_at' => now()->addDays(30),
            'scopes' => ['youtube', 'youtube.upload', 'youtube.readonly'],
            'status' => 'active',
            'is_default' => true,
            'nickname' => 'Main Channel',
            'metadata' => ['subscriber_count' => 125000, 'video_count' => 245],
            'last_synced_at' => now(),
        ]));

        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'youtube',
            'platform_user_id' => 'UC_y7XG2OV3P7uZZ6FSM8Uuw',
            'username' => 'GamingVlogs',
            'name' => 'Gaming & Vlogs',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Gaming+Vlogs&background=FF0000&color=fff',
            'access_token' => encrypt('test_youtube_access_token_2'),
            'refresh_token' => encrypt('test_youtube_refresh_token_2'),
            'token_expires_at' => now()->addDays(30),
            'scopes' => ['youtube', 'youtube.upload'],
            'status' => 'active',
            'is_default' => false,
            'nickname' => 'Gaming Channel',
            'metadata' => ['subscriber_count' => 45000, 'video_count' => 128],
            'last_synced_at' => now(),
        ]));

        // Facebook account
        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'facebook',
            'platform_user_id' => '123456789012345',
            'username' => 'techreviewspage',
            'name' => 'Tech Reviews Official',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Tech+Reviews&background=1877F2&color=fff',
            'access_token' => encrypt('test_facebook_page_access_token'),
            'refresh_token' => null, // Facebook Page tokens don't expire
            'token_expires_at' => null,
            'scopes' => ['pages_manage_posts', 'pages_read_engagement'],
            'status' => 'active',
            'is_default' => true,
            'metadata' => ['page_likes' => 85000],
            'last_synced_at' => now(),
        ]));

        // Instagram accounts
        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'instagram',
            'platform_user_id' => '17841405309213020',
            'username' => 'tech.reviews.official',
            'name' => 'Tech Reviews',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Tech+Reviews&background=E4405F&color=fff',
            'access_token' => encrypt('test_instagram_access_token_1'),
            'refresh_token' => null,
            'token_expires_at' => now()->addDays(60),
            'scopes' => ['instagram_basic', 'instagram_content_publish'],
            'status' => 'active',
            'is_default' => true,
            'nickname' => 'Main Account',
            'metadata' => ['followers_count' => 92000, 'media_count' => 342],
            'last_synced_at' => now(),
        ]));

        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'instagram',
            'platform_user_id' => '17841405309213021',
            'username' => 'tech.unboxing',
            'name' => 'Tech Unboxing',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Unboxing&background=E4405F&color=fff',
            'access_token' => encrypt('test_instagram_access_token_2'),
            'refresh_token' => null,
            'token_expires_at' => now()->addDays(60),
            'scopes' => ['instagram_basic', 'instagram_content_publish'],
            'status' => 'active',
            'is_default' => false,
            'nickname' => 'Unboxing',
            'metadata' => ['followers_count' => 34000, 'media_count' => 156],
            'last_synced_at' => now(),
        ]));

        // TikTok account
        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'tiktok',
            'platform_user_id' => '6845123456789012345',
            'username' => 'techreviews_official',
            'name' => 'Tech Reviews',
            'avatar_url' => 'https://ui-avatars.com/api/?name=TikTok&background=000000&color=fff',
            'access_token' => encrypt('test_tiktok_access_token'),
            'refresh_token' => encrypt('test_tiktok_refresh_token'),
            'token_expires_at' => now()->addDays(30),
            'scopes' => ['video.upload', 'video.list'],
            'status' => 'active',
            'is_default' => true,
            'metadata' => ['follower_count' => 156000, 'video_count' => 89],
            'last_synced_at' => now(),
        ]));

        // Threads account
        $accounts->push(SocialAccount::create([
            'user_id' => $user->id,
            'platform' => 'threads',
            'platform_user_id' => '17841405309213030',
            'username' => 'tech.reviews',
            'name' => 'Tech Reviews',
            'avatar_url' => 'https://ui-avatars.com/api/?name=Threads&background=000000&color=fff',
            'access_token' => encrypt('test_threads_access_token'),
            'refresh_token' => null,
            'token_expires_at' => now()->addDays(60),
            'scopes' => ['threads_basic', 'threads_content_publish'],
            'status' => 'active',
            'is_default' => true,
            'metadata' => ['followers_count' => 28000],
            'last_synced_at' => now(),
        ]));

        return $accounts;
    }

    /**
     * Create posts with various statuses.
     */
    protected function createPosts($accounts)
    {
        $this->command->info('Creating posts...');

        $posts = collect();

        // Sample video titles and descriptions
        $postTemplates = [
            [
                'title' => 'iPhone 15 Pro Max Review - Worth the Upgrade?',
                'description' => 'In-depth review of the latest iPhone with camera tests, battery life analysis, and performance benchmarks. Is it worth upgrading from the iPhone 14 Pro?',
                'hashtags' => ['iPhone15', 'AppleEvent', 'TechReview', 'Smartphone', 'iOS17'],
            ],
            [
                'title' => 'Top 5 Budget Laptops Under $500 in 2024',
                'description' => 'Best affordable laptops for students and professionals. Comparing specs, performance, and value for money across different brands.',
                'hashtags' => ['BudgetLaptop', 'TechDeals', 'BackToSchool', 'Laptop2024', 'StudentTech'],
            ],
            [
                'title' => 'PS5 vs Xbox Series X - Ultimate Gaming Showdown',
                'description' => 'Head-to-head comparison of the latest gaming consoles. Which one should you buy? Performance, exclusives, and value analysis.',
                'hashtags' => ['PS5', 'XboxSeriesX', 'Gaming', 'ConsoleWars', 'GameReview'],
            ],
            [
                'title' => 'Galaxy S24 Ultra Unboxing - First Impressions',
                'description' => "Unboxing Samsung's latest flagship smartphone. What's in the box, initial setup, and first look at the new features and design.",
                'hashtags' => ['Samsung', 'GalaxyS24', 'Unboxing', 'Android', 'Smartphone'],
            ],
            [
                'title' => 'Best Smart Home Devices for 2024',
                'description' => 'Top smart home gadgets that will make your life easier. From smart lights to security cameras and voice assistants.',
                'hashtags' => ['SmartHome', 'IoT', 'HomeAutomation', 'TechGadgets', 'SmartDevices'],
            ],
            [
                'title' => 'MacBook Air M3 Review - The Perfect Laptop?',
                'description' => 'Comprehensive review of the new MacBook Air with M3 chip. Performance tests, battery life, and comparison with M2 model.',
                'hashtags' => ['MacBook', 'AppleSilicon', 'M3Chip', 'LaptopReview', 'Apple'],
            ],
            [
                'title' => 'AirPods Pro 2 vs Sony WH-1000XM5 - Which to Buy?',
                'description' => 'Ultimate headphone comparison. Testing noise cancellation, sound quality, comfort, and features of the top wireless headphones.',
                'hashtags' => ['AirPodsPro', 'Sony', 'Headphones', 'AudioGear', 'TechComparison'],
            ],
            [
                'title' => 'Behind the Scenes - How I Create Tech Videos',
                'description' => 'A look at my video production workflow, camera gear, editing software, and tips for aspiring tech YouTubers.',
                'hashtags' => ['BehindTheScenes', 'VideoProduction', 'ContentCreator', 'YouTubeTips', 'TechYouTuber'],
            ],
        ];

        // Create published posts (older posts)
        foreach ($accounts as $index => $account) {
            $numPublished = rand(3, 5);

            for ($i = 0; $i < $numPublished; $i++) {
                $template = $postTemplates[$i % count($postTemplates)];
                $publishedAt = now()->subDays(rand(7, 90));

                $posts->push(SocialPost::create([
                    'user_id' => $account->user_id,
                    'social_account_id' => $account->id,
                    'title' => $template['title'],
                    'description' => $template['description'],
                    'hashtags' => $template['hashtags'],
                    'video_path' => 'social-media/videos/' . uniqid() . '.mp4',
                    'thumbnail_path' => 'social-media/videos/thumbnails/' . uniqid() . '.jpg',
                    'platform_post_id' => strtoupper(uniqid('POST_')),
                    'status' => 'published',
                    'scheduled_at' => null,
                    'published_at' => $publishedAt,
                    'metadata' => [
                        'duration' => rand(300, 900), // 5-15 minutes
                        'file_size' => rand(50000000, 500000000), // 50MB - 500MB
                    ],
                    'created_at' => $publishedAt->copy()->subHours(2),
                    'updated_at' => $publishedAt,
                ]));
            }
        }

        // Create scheduled posts (future)
        $scheduledAccount = $accounts->random();
        for ($i = 0; $i < 3; $i++) {
            $template = $postTemplates[($i + 5) % count($postTemplates)];
            $scheduledAt = now()->addDays(rand(1, 14));

            $posts->push(SocialPost::create([
                'user_id' => $scheduledAccount->user_id,
                'social_account_id' => $scheduledAccount->id,
                'title' => $template['title'] . ' (Scheduled)',
                'description' => $template['description'],
                'hashtags' => $template['hashtags'],
                'video_path' => 'social-media/videos/' . uniqid() . '.mp4',
                'thumbnail_path' => 'social-media/videos/thumbnails/' . uniqid() . '.jpg',
                'status' => 'scheduled',
                'scheduled_at' => $scheduledAt,
                'published_at' => null,
                'metadata' => ['duration' => rand(300, 900)],
            ]));
        }

        // Create draft posts
        $draftAccount = $accounts->random();
        for ($i = 0; $i < 2; $i++) {
            $template = $postTemplates[$i % count($postTemplates)];

            $posts->push(SocialPost::create([
                'user_id' => $draftAccount->user_id,
                'social_account_id' => $draftAccount->id,
                'title' => $template['title'] . ' (Draft)',
                'description' => $template['description'],
                'hashtags' => $template['hashtags'],
                'video_path' => 'social-media/videos/' . uniqid() . '.mp4',
                'status' => 'draft',
                'scheduled_at' => null,
                'published_at' => null,
            ]));
        }

        // Create a failed post
        $failedAccount = $accounts->random();
        $posts->push(SocialPost::create([
            'user_id' => $failedAccount->user_id,
            'social_account_id' => $failedAccount->id,
            'title' => 'Failed Upload - Testing Error Handling',
            'description' => 'This post failed during upload to test error handling.',
            'hashtags' => ['test', 'error'],
            'video_path' => 'social-media/videos/' . uniqid() . '.mp4',
            'status' => 'failed',
            'scheduled_at' => null,
            'published_at' => null,
            'metadata' => ['error' => 'API rate limit exceeded'],
        ]));

        return $posts;
    }

    /**
     * Create metrics for published posts.
     */
    protected function createMetrics($posts)
    {
        $this->command->info('Creating metrics...');

        $publishedPosts = $posts->where('status', 'published');

        foreach ($publishedPosts as $post) {
            // Calculate days since published
            $daysSincePublished = now()->diffInDays($post->published_at);

            // Create metrics for each day since publication (up to 30 days)
            $daysToCreate = min($daysSincePublished, 30);

            $baseViews = rand(5000, 50000);
            $baseLikes = rand(200, 2000);
            $baseComments = rand(50, 500);
            $baseShares = rand(20, 200);

            for ($day = 0; $day < $daysToCreate; $day++) {
                $date = $post->published_at->copy()->addDays($day);

                // Views grow over time with some randomness
                $viewGrowthFactor = 1 + ($day * 0.3) + (rand(-10, 10) / 100);
                $views = (int)($baseViews * $viewGrowthFactor);

                $likes = (int)($baseLikes * $viewGrowthFactor);
                $comments = (int)($baseComments * $viewGrowthFactor);
                $shares = (int)($baseShares * $viewGrowthFactor);

                $impressions = (int)($views * 1.5);
                $reach = (int)($views * 0.8);

                // Calculate engagement rate
                $totalEngagement = $likes + $comments + $shares;
                $engagementRate = $views > 0 ? round(($totalEngagement / $views) * 100, 2) : 0;

                SocialMetric::create([
                    'social_post_id' => $post->id,
                    'social_account_id' => $post->social_account_id,
                    'metric_type' => 'post_performance',
                    'date' => $date,
                    'views' => $views,
                    'likes' => $likes,
                    'comments' => $comments,
                    'shares' => $shares,
                    'impressions' => $impressions,
                    'reach' => $reach,
                    'engagement_rate' => $engagementRate,
                    'demographics' => [
                        'age_groups' => [
                            '18-24' => rand(15, 30),
                            '25-34' => rand(30, 45),
                            '35-44' => rand(15, 25),
                            '45-54' => rand(5, 15),
                            '55+' => rand(3, 10),
                        ],
                        'gender' => [
                            'male' => rand(55, 75),
                            'female' => rand(20, 40),
                            'other' => rand(1, 5),
                        ],
                        'top_countries' => [
                            'US' => rand(30, 50),
                            'UK' => rand(10, 20),
                            'Canada' => rand(5, 15),
                            'India' => rand(5, 10),
                            'Others' => rand(10, 30),
                        ],
                    ],
                    'metadata' => [
                        'average_watch_time' => rand(180, 600),
                        'click_through_rate' => rand(2, 8),
                    ],
                ]);
            }
        }
    }
}
