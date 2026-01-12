import HashtagInput from '@/components/social-media/HashtagInput';
import PlatformSelector from '@/components/social-media/PlatformSelector';
import VideoUploader from '@/components/social-media/VideoUploader';
import SocialMediaLayout from '@/layouts/SocialMediaLayout';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, Clock, Send } from 'lucide-react';
import { FormEventHandler, useCallback, useState } from 'react';

/**
 * Social Account Interface
 *
 * Represents a connected social media account
 */
interface SocialAccount {
    id: number;
    platform: string;
    username: string;
    name: string;
    avatar_url: string | null;
    is_default: boolean;
    nickname: string | null;
}

/**
 * Platform Accounts Collection
 *
 * Accounts grouped by platform
 */
type PlatformAccounts = Record<string, SocialAccount[]>;

/**
 * Video Upload Data
 *
 * Data returned after successful video upload
 */
interface VideoUploadData {
    path: string;
    url: string;
    duration?: number;
    width?: number;
    height?: number;
    thumbnail_path?: string;
    thumbnail_url?: string;
}

/**
 * CreatePost Page Props
 *
 * Props passed from Laravel controller via Inertia
 */
interface CreatePostProps {
    /** Connected social media accounts grouped by platform */
    accounts: PlatformAccounts;
}

/**
 * Post Form Data
 *
 * Form data structure for creating a social media post
 */
interface PostFormData {
    title: string;
    description: string;
    hashtags: string[];
    video_path: string;
    thumbnail?: File | null;
    social_account_id: number | null;
    scheduled_at: string;
    publish_now: boolean;
}

/**
 * Platform Configuration
 *
 * Character limits and constraints for each platform
 */
const PLATFORM_LIMITS = {
    youtube: {
        title: 100,
        description: 5000,
        hashtags: 30,
    },
    facebook: {
        title: 255,
        description: 5000,
        hashtags: 30,
    },
    instagram: {
        title: 255,
        description: 2200,
        hashtags: 30,
    },
    tiktok: {
        title: 255,
        description: 2200,
        hashtags: 30,
    },
    threads: {
        title: 255,
        description: 500,
        hashtags: 30,
    },
};

/**
 * CreatePost Page Component
 *
 * Main page for creating and scheduling social media posts with:
 * - Video upload with drag-and-drop support
 * - Post content editor (title, description, hashtags)
 * - Platform and account selection
 * - Publish immediately or schedule for later
 * - Platform-specific character limit validation
 * - Real-time character counters
 * - Dark mode support
 * - Comprehensive form validation
 *
 * Features:
 * - Upload video with automatic thumbnail generation
 * - Add hashtags with validation
 * - Select target social media account
 * - Choose to publish now or schedule for future
 * - See platform-specific limits and warnings
 * - Responsive design for mobile and desktop
 */
export default function CreatePost({ accounts }: CreatePostProps) {
    // Video upload state
    const [uploadedVideo, setUploadedVideo] = useState<VideoUploadData | null>(null);

    // Get the selected account to determine platform limits
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    // Form state using Inertia's useForm hook
    const { data, setData, post, processing, errors, reset } = useForm<PostFormData>({
        title: '',
        description: '',
        hashtags: [],
        video_path: '',
        thumbnail: null,
        social_account_id: null,
        scheduled_at: '',
        publish_now: true,
    });

    /**
     * Handle successful video upload
     *
     * Updates form state with video path and stores upload data
     */
    const handleVideoUpload = useCallback(
        (videoData: VideoUploadData) => {
            setUploadedVideo(videoData);
            setData('video_path', videoData.path);
        },
        [setData],
    );

    /**
     * Handle video upload error
     *
     * Shows error message to user
     */
    const handleVideoUploadError = useCallback((error: string) => {
        // TODO: Show toast notification with error
        console.error('Video upload failed:', error);
    }, []);

    /**
     * Handle account selection
     *
     * Updates selected account and determines platform limits
     */
    const handleAccountSelect = useCallback(
        (accountId: number) => {
            setData('social_account_id', accountId);

            // Find the selected account to determine platform
            for (const [platform, platformAccounts] of Object.entries(accounts)) {
                const account = platformAccounts.find((acc) => acc.id === accountId);
                if (account) {
                    setSelectedPlatform(platform);
                    break;
                }
            }
        },
        [setData, accounts],
    );

    /**
     * Handle form submission
     *
     * Validates and submits the post creation form
     */
    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit to Laravel controller
        post(route('admin.social-media.posts.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setUploadedVideo(null);
                setSelectedPlatform(null);
            },
        });
    };

    // Get platform limits for selected account
    const limits = selectedPlatform
        ? PLATFORM_LIMITS[selectedPlatform as keyof typeof PLATFORM_LIMITS]
        : { title: 255, description: 5000, hashtags: 30 };

    // Calculate remaining characters
    const titleRemaining = limits.title - data.title.length;
    const descriptionRemaining = limits.description - data.description.length;

    // Check if form is valid
    const isFormValid =
        data.video_path && data.social_account_id && data.title.trim() && data.description.trim() && titleRemaining >= 0 && descriptionRemaining >= 0;

    return (
        <SocialMediaLayout>
            <Head title="Create Social Media Post" />

            <div className="mx-auto max-w-4xl">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Create Social Media Post</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Upload a video, add details, and publish to your connected social media accounts.
                    </p>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Upload Section */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Video</h2>

                        <VideoUploader
                            onUploadComplete={handleVideoUpload}
                            onUploadError={handleVideoUploadError}
                            maxSize={2 * 1024 * 1024 * 1024} // 2GB
                        />

                        {errors.video_path && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.video_path}</p>}
                    </div>

                    {/* Account Selection Section */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Select Account</h2>

                        <PlatformSelector accounts={accounts} selectedAccountId={data.social_account_id} onAccountSelect={handleAccountSelect} />

                        {errors.social_account_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.social_account_id}</p>}
                    </div>

                    {/* Post Content Section */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Post Details</h2>

                        <div className="space-y-4">
                            {/* Title Input */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={`mt-1 block w-full rounded-lg border px-4 py-2 transition-colors ${
                                        errors.title
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                                    } bg-white dark:bg-gray-900 dark:text-gray-100`}
                                    placeholder="Enter a catchy title for your post..."
                                    maxLength={limits.title}
                                />

                                {/* Character Counter */}
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    {errors.title ? (
                                        <span className="text-red-600 dark:text-red-400">{errors.title}</span>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">This will be your post title</span>
                                    )}
                                    <span
                                        className={`font-medium ${
                                            titleRemaining < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {titleRemaining} / {limits.title}
                                    </span>
                                </div>
                            </div>

                            {/* Description Textarea */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    rows={6}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={`mt-1 block w-full rounded-lg border px-4 py-2 transition-colors ${
                                        errors.description
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
                                    } bg-white dark:bg-gray-900 dark:text-gray-100`}
                                    placeholder="Write a detailed description of your video..."
                                    maxLength={limits.description}
                                />

                                {/* Character Counter */}
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    {errors.description ? (
                                        <span className="text-red-600 dark:text-red-400">{errors.description}</span>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">Describe what your video is about</span>
                                    )}
                                    <span
                                        className={`font-medium ${
                                            descriptionRemaining < 100 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        {descriptionRemaining} / {limits.description}
                                    </span>
                                </div>
                            </div>

                            {/* Hashtags Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags</label>
                                <div className="mt-1">
                                    <HashtagInput
                                        value={data.hashtags}
                                        onChange={(hashtags) => setData('hashtags', hashtags)}
                                        maxHashtags={limits.hashtags}
                                        placeholder="Add hashtags to increase discoverability..."
                                    />
                                </div>
                                {errors.hashtags && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.hashtags}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Publishing Options Section */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Publishing Options</h2>

                        <div className="space-y-4">
                            {/* Publish Now Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Send className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Publish Immediately</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Post will be published right away</p>
                                    </div>
                                </div>

                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.publish_now}
                                        onChange={(e) => {
                                            setData('publish_now', e.target.checked);
                                            if (e.target.checked) {
                                                setData('scheduled_at', '');
                                            }
                                        }}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                                </label>
                            </div>

                            {/* Schedule DateTime Picker */}
                            {!data.publish_now && (
                                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div className="flex-1">
                                            <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Schedule for Later
                                            </label>
                                            <input
                                                type="datetime-local"
                                                id="scheduled_at"
                                                value={data.scheduled_at}
                                                onChange={(e) => setData('scheduled_at', e.target.value)}
                                                min={new Date().toISOString().slice(0, 16)}
                                                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                                            />
                                            {errors.scheduled_at && (
                                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.scheduled_at}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Scheduled Time Display */}
                                    {data.scheduled_at && (
                                        <div className="mt-2 flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                Will be published on{' '}
                                                {new Date(data.scheduled_at).toLocaleString('en-US', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!isFormValid || processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    <span>Processing...</span>
                                </>
                            ) : data.publish_now ? (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span>Publish Now</span>
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-4 w-4" />
                                    <span>Schedule Post</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </SocialMediaLayout>
    );
}
