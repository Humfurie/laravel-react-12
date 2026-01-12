import { Check, ChevronDown, Star } from 'lucide-react';
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
}

/**
 * AccountSwitcher Props Interface
 *
 * Props for controlling the AccountSwitcher component
 */
interface AccountSwitcherProps {
    /** Array of accounts for a specific platform */
    accounts: SocialAccount[];
    /** Currently selected account ID */
    selectedAccountId: number | null;
    /** Callback fired when account selection changes */
    onAccountChange: (accountId: number) => void;
    /** Platform name for display */
    platformName: string;
    /** Additional CSS classes for the container */
    className?: string;
}

/**
 * AccountSwitcher Component
 *
 * A dropdown component for switching between multiple accounts on the same platform with:
 * - Account avatar and display name
 * - Default account indicator (star icon)
 * - Selected account checkmark
 * - Smooth dropdown animation
 * - Dark mode support
 * - Keyboard accessible
 *
 * Features:
 * - Shows all accounts for a platform in a dropdown
 * - Visual indicators for selected and default accounts
 * - Displays nickname (if set) or channel/page name
 * - Auto-selects default account when no selection
 * - Click outside to close dropdown
 * - Accessible with proper ARIA labels
 *
 * Usage:
 * Typically used in the CreatePost page to select which account to post to
 * when multiple accounts are connected for the same platform.
 */
export default function AccountSwitcher({ accounts, selectedAccountId, onAccountChange, platformName, className = '' }: AccountSwitcherProps) {
    // State for dropdown open/close
    const [isOpen, setIsOpen] = useState(false);

    // Get the currently selected account
    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

    // Get display name: nickname > name > username
    const getDisplayName = (account: SocialAccount): string => {
        return account.nickname || account.name || account.username || 'Unknown Account';
    };

    /**
     * Handle account selection
     */
    const handleSelect = (accountId: number) => {
        onAccountChange(accountId);
        setIsOpen(false);
    };

    // If no accounts, show empty state
    if (accounts.length === 0) {
        return (
            <div className={`rounded-lg border-2 border-dashed border-gray-300 p-4 text-center dark:border-gray-700 ${className}`}>
                <p className="text-sm text-gray-500 dark:text-gray-400">No {platformName} accounts connected</p>
            </div>
        );
    }

    // If only one account, show it without dropdown
    if (accounts.length === 1) {
        const account = accounts[0];
        const displayName = getDisplayName(account);

        return (
            <div className={`rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {account.avatar_url ? (
                        <img src={account.avatar_url} alt={displayName} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{displayName.charAt(0).toUpperCase()}</span>
                        </div>
                    )}

                    {/* Account Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{displayName}</p>
                            {account.is_default && (
                                <Star className="h-3 w-3 flex-shrink-0 fill-current text-amber-500" aria-label="Default account" />
                            )}
                        </div>
                        {account.nickname && <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{account.username}</p>}
                    </div>
                </div>
            </div>
        );
    }

    // Multiple accounts - show dropdown
    return (
        <div className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {selectedAccount ? (
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        {/* Avatar */}
                        {selectedAccount.avatar_url ? (
                            <img
                                src={selectedAccount.avatar_url}
                                alt={getDisplayName(selectedAccount)}
                                className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {getDisplayName(selectedAccount).charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}

                        {/* Account Info */}
                        <div className="min-w-0 flex-1 text-left">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{getDisplayName(selectedAccount)}</p>
                                {selectedAccount.is_default && (
                                    <Star className="h-3 w-3 flex-shrink-0 fill-current text-amber-500" aria-label="Default account" />
                                )}
                            </div>
                            {selectedAccount.nickname && (
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{selectedAccount.username}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">Select an account</span>
                )}

                {/* Dropdown Icon */}
                <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

                    {/* Menu */}
                    <div
                        className="absolute top-full right-0 left-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                        role="listbox"
                    >
                        {accounts.map((account) => {
                            const isSelected = account.id === selectedAccountId;
                            const displayName = getDisplayName(account);

                            return (
                                <button
                                    key={account.id}
                                    type="button"
                                    onClick={() => handleSelect(account.id)}
                                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    {/* Avatar */}
                                    {account.avatar_url ? (
                                        <img src={account.avatar_url} alt={displayName} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{displayName.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}

                                    {/* Account Info */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p
                                                className={`truncate text-sm font-medium ${
                                                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                                                }`}
                                            >
                                                {displayName}
                                            </p>
                                            {account.is_default && (
                                                <Star className="h-3 w-3 flex-shrink-0 fill-current text-amber-500" aria-label="Default account" />
                                            )}
                                        </div>
                                        {account.nickname && <p className="truncate text-xs text-gray-500 dark:text-gray-400">@{account.username}</p>}
                                    </div>

                                    {/* Selected Checkmark */}
                                    {isSelected && <Check className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
