import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import SocialAccountCard from './SocialAccountCard';

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
    status: 'active' | 'expired' | 'error';
    token_expires_at: string | null;
}

/**
 * AccountGroupCard Props Interface
 *
 * Props for controlling the AccountGroupCard component
 */
interface AccountGroupCardProps {
    /** Platform identifier (youtube, facebook, instagram, tiktok, threads) */
    platform: string;
    /** Array of social media accounts for this platform */
    accounts: SocialAccount[];
    /** Optional callback when accounts are updated */
    onUpdate?: () => void;
    /** Additional CSS classes for the card */
    className?: string;
}

/**
 * Platform Configuration
 *
 * Display information for each platform
 */
const PLATFORM_CONFIG: Record<
    string,
    {
        name: string;
        color: string;
        icon: string;
        gradient: string;
    }
> = {
    youtube: {
        name: 'YouTube',
        color: 'bg-red-500',
        icon: '▶️',
        gradient: 'from-red-500 to-red-600',
    },
    facebook: {
        name: 'Facebook',
        color: 'bg-blue-600',
        icon: '📘',
        gradient: 'from-blue-600 to-blue-700',
    },
    instagram: {
        name: 'Instagram',
        color: 'bg-pink-500',
        icon: '📷',
        gradient: 'from-pink-500 to-purple-600',
    },
    tiktok: {
        name: 'TikTok',
        color: 'bg-black',
        icon: '🎵',
        gradient: 'from-black to-gray-800',
    },
    threads: {
        name: 'Threads',
        color: 'bg-gray-800',
        icon: '🧵',
        gradient: 'from-gray-800 to-gray-900',
    },
};

/**
 * AccountGroupCard Component
 *
 * Groups and displays multiple social media accounts for a single platform with:
 * - Platform header with branding (logo, name, account count)
 * - Grid layout of SocialAccountCard components
 * - "Connect Another Account" button
 * - Responsive design (1-3 columns based on screen size)
 * - Dark mode support
 * - Platform-specific color scheme
 *
 * Features:
 * - Shows all connected accounts for a platform
 * - Displays account count in header
 * - Easy way to connect additional accounts
 * - Passes through update callbacks to child cards
 * - Platform-specific gradient header
 */
export default function AccountGroupCard({ platform, accounts, onUpdate, className = '' }: AccountGroupCardProps) {
    // Get platform configuration
    const platformConfig = PLATFORM_CONFIG[platform] || {
        name: platform.charAt(0).toUpperCase() + platform.slice(1),
        color: 'bg-gray-500',
        icon: '🔗',
        gradient: 'from-gray-500 to-gray-600',
    };

    /**
     * Navigate to OAuth connection flow for this platform
     */
    const handleConnectAnother = () => {
        router.visit(route('admin.social-media.connect', platform));
    };

    return (
        <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}>
            {/* Platform Header */}
            <div className={`bg-gradient-to-r ${platformConfig.gradient} px-6 py-4 text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Platform Icon */}
                        <span className="text-2xl" aria-hidden="true">
                            {platformConfig.icon}
                        </span>

                        {/* Platform Name and Count */}
                        <div>
                            <h2 className="text-lg font-semibold">{platformConfig.name}</h2>
                            <p className="text-sm opacity-90">
                                {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} connected
                            </p>
                        </div>
                    </div>

                    {/* Connect Another Button */}
                    <button
                        type="button"
                        onClick={handleConnectAnother}
                        className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                        aria-label={`Connect another ${platformConfig.name} account`}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Connect Another</span>
                    </button>
                </div>
            </div>

            {/* Accounts Grid */}
            <div className="p-6">
                {accounts.length === 0 ? (
                    // Empty State
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No accounts connected yet</p>
                        <button
                            type="button"
                            onClick={handleConnectAnother}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            <Plus className="h-4 w-4" />
                            Connect {platformConfig.name} Account
                        </button>
                    </div>
                ) : (
                    // Accounts Grid
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <SocialAccountCard key={account.id} account={account} onUpdate={onUpdate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
