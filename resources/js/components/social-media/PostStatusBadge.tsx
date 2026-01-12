/**
 * Post Status Type
 *
 * Possible status values for a social media post
 */
type PostStatus = 'draft' | 'scheduled' | 'processing' | 'published' | 'failed';

/**
 * PostStatusBadge Props Interface
 *
 * Props for controlling the PostStatusBadge component
 */
interface PostStatusBadgeProps {
    /** Current status of the post */
    status: PostStatus;
    /** Additional CSS classes for the badge */
    className?: string;
}

/**
 * Status Configuration
 *
 * Visual styling and labels for each status
 */
const STATUS_CONFIG: Record<
    PostStatus,
    {
        label: string;
        bgColor: string;
        textColor: string;
        dotColor: string;
    }
> = {
    draft: {
        label: 'Draft',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
        textColor: 'text-gray-700 dark:text-gray-300',
        dotColor: 'bg-gray-500',
    },
    scheduled: {
        label: 'Scheduled',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        textColor: 'text-blue-700 dark:text-blue-300',
        dotColor: 'bg-blue-500',
    },
    processing: {
        label: 'Processing',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        dotColor: 'bg-yellow-500',
    },
    published: {
        label: 'Published',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-300',
        dotColor: 'bg-green-500',
    },
    failed: {
        label: 'Failed',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        dotColor: 'bg-red-500',
    },
};

/**
 * PostStatusBadge Component
 *
 * A color-coded status badge for social media posts with:
 * - Status-specific colors (draft=gray, scheduled=blue, processing=yellow, published=green, failed=red)
 * - Animated pulse dot for processing status
 * - Dark mode support
 * - Consistent styling across the application
 *
 * Features:
 * - Visual status indicator with colored dot
 * - Status label text
 * - Pulsing animation for "processing" status
 * - Accessible with proper color contrast
 */
export default function PostStatusBadge({ status, className = '' }: PostStatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
        >
            {/* Status Dot - Animated for processing */}
            <span className={`h-2 w-2 rounded-full ${config.dotColor} ${status === 'processing' ? 'animate-pulse' : ''}`} aria-hidden="true" />

            {/* Status Label */}
            <span>{config.label}</span>
        </span>
    );
}
