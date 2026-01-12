import { router } from '@inertiajs/react';
import { Edit2, RefreshCw, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
 * SocialAccountCard Props Interface
 *
 * Props for controlling the SocialAccountCard component
 */
interface SocialAccountCardProps {
    /** The social media account to display */
    account: SocialAccount;
    /** Optional callback when account is updated */
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
    }
> = {
    youtube: {
        name: 'YouTube',
        color: 'bg-red-500',
        icon: '▶️',
    },
    facebook: {
        name: 'Facebook',
        color: 'bg-blue-600',
        icon: '📘',
    },
    instagram: {
        name: 'Instagram',
        color: 'bg-pink-500',
        icon: '📷',
    },
    tiktok: {
        name: 'TikTok',
        color: 'bg-black',
        icon: '🎵',
    },
    threads: {
        name: 'Threads',
        color: 'bg-gray-800',
        icon: '🧵',
    },
};

/**
 * SocialAccountCard Component
 *
 * Displays a social media account card with:
 * - Platform icon and branding
 * - Account avatar and display name
 * - Default account indicator (star icon)
 * - Optional nickname display
 * - Account status badge (active, expired, error)
 * - Action buttons (Set as Default, Edit Nickname, Refresh Token, Disconnect)
 * - Dark mode support
 * - Hover effects and transitions
 *
 * Features:
 * - Shows platform-specific styling and icons
 * - Displays user-defined nickname or account name
 * - Visual indicator for default account
 * - Quick actions via dropdown menu
 * - Token expiration warning
 * - Accessible with proper ARIA labels
 */
export default function SocialAccountCard({ account, onUpdate, className = '' }: SocialAccountCardProps) {
    // State for managing actions dropdown
    const [showActions, setShowActions] = useState(false);
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nickname, setNickname] = useState(account.nickname || '');
    const [isProcessing, setIsProcessing] = useState(false);

    // Get platform configuration
    const platformConfig = PLATFORM_CONFIG[account.platform] || {
        name: account.platform,
        color: 'bg-gray-500',
        icon: '🔗',
    };

    // Display name logic: nickname > name > username
    const displayName = account.nickname || account.name || account.username || 'Unknown Account';

    /**
     * Set account as default for its platform
     */
    const handleSetDefault = async () => {
        if (isProcessing || account.is_default) return;

        setIsProcessing(true);
        router.post(
            route('admin.social-media.accounts.set-default', account.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowActions(false);
                    onUpdate?.();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    /**
     * Update account nickname
     */
    const handleUpdateNickname = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        router.put(
            route('admin.social-media.accounts.update-nickname', account.id),
            { nickname: nickname.trim() || null },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditingNickname(false);
                    setShowActions(false);
                    onUpdate?.();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    /**
     * Refresh account token
     */
    const handleRefreshToken = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        router.post(
            route('admin.social-media.accounts.refresh-token', account.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowActions(false);
                    onUpdate?.();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    /**
     * Disconnect account
     */
    const handleDisconnect = async () => {
        if (isProcessing) return;

        if (!confirm(`Are you sure you want to disconnect ${displayName}?`)) {
            return;
        }

        setIsProcessing(true);
        router.delete(route('admin.social-media.accounts.disconnect', account.id), {
            preserveScroll: true,
            onSuccess: () => {
                onUpdate?.();
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${className}`}
        >
            {/* Platform Color Bar */}
            <div className={`h-1 ${platformConfig.color}`} />

            {/* Card Content */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {account.avatar_url ? (
                            <img
                                src={account.avatar_url}
                                alt={displayName}
                                className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover dark:border-gray-700"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
                                <span className="text-lg text-gray-500 dark:text-gray-400">{displayName.charAt(0).toUpperCase()}</span>
                            </div>
                        )}
                    </div>

                    {/* Account Info */}
                    <div className="min-w-0 flex-1">
                        {/* Display Name and Platform */}
                        <div className="flex items-center gap-2">
                            {isEditingNickname ? (
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateNickname();
                                        if (e.key === 'Escape') {
                                            setIsEditingNickname(false);
                                            setNickname(account.nickname || '');
                                        }
                                    }}
                                    onBlur={handleUpdateNickname}
                                    placeholder={account.name || account.username}
                                    className="block w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <h3 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</h3>

                                    {/* Default Badge */}
                                    {account.is_default && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                            <Star className="h-3 w-3 fill-current" />
                                            Default
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Username (if different from display name) */}
                        {account.nickname && <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">@{account.username}</p>}

                        {/* Platform Badge */}
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-sm">{platformConfig.icon}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{platformConfig.name}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-2">
                            {account.status === 'active' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    Active
                                </span>
                            )}
                            {account.status === 'expired' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    Token Expired
                                </span>
                            )}
                            {account.status === 'error' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    Error
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowActions(!showActions)}
                            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            aria-label="Account actions"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showActions && (
                            <>
                                {/* Backdrop */}
                                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />

                                {/* Menu */}
                                <div className="absolute top-8 right-0 z-20 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    {/* Set as Default */}
                                    {!account.is_default && (
                                        <button
                                            type="button"
                                            onClick={handleSetDefault}
                                            disabled={isProcessing}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            <Star className="h-4 w-4" />
                                            Set as Default
                                        </button>
                                    )}

                                    {/* Edit Nickname */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingNickname(true);
                                            setShowActions(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        Edit Nickname
                                    </button>

                                    {/* Refresh Token */}
                                    {account.status === 'expired' && (
                                        <button
                                            type="button"
                                            onClick={handleRefreshToken}
                                            disabled={isProcessing}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Refresh Token
                                        </button>
                                    )}

                                    {/* Disconnect */}
                                    <button
                                        type="button"
                                        onClick={handleDisconnect}
                                        disabled={isProcessing}
                                        className="flex w-full items-center gap-2 border-t border-gray-200 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Disconnect
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}
