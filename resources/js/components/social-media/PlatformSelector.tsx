import { Check } from 'lucide-react';

/**
 * Social Account Interface
 *
 * Represents a connected social media account
 */
interface SocialAccount {
  id: number;
  platform: string; // youtube, facebook, instagram, tiktok, threads
  username: string;
  name: string; // Channel/Page name
  avatar_url: string | null;
  is_default: boolean;
  nickname: string | null; // User-defined label (e.g., "Personal", "Business")
}

/**
 * Platform Accounts Collection
 *
 * Accounts grouped by platform
 */
type PlatformAccounts = Record<string, SocialAccount[]>;

/**
 * PlatformSelector Props Interface
 *
 * Props for controlling the PlatformSelector component
 */
interface PlatformSelectorProps {
  /** Connected accounts grouped by platform */
  accounts: PlatformAccounts;
  /** Currently selected account ID */
  selectedAccountId: number | null;
  /** Callback fired when account selection changes */
  onAccountSelect: (accountId: number) => void;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Platform Configuration
 *
 * Display information for each platform
 */
const PLATFORM_CONFIG = {
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
 * PlatformSelector Component
 *
 * Displays connected social media accounts grouped by platform with:
 * - Platform-based grouping with badges
 * - Account selection with radio buttons
 * - Visual indicators for default accounts
 * - Support for multiple accounts per platform
 * - Account avatars and nicknames
 * - Dark mode support
 * - Accessible with proper ARIA labels
 *
 * Features:
 * - Shows all accounts grouped by platform
 * - Allows selecting one account for posting
 * - Displays account nickname (if set) or channel/page name
 * - Highlights default account for each platform
 * - Empty state if no accounts connected
 */
export default function PlatformSelector({
  accounts,
  selectedAccountId,
  onAccountSelect,
  className = '',
}: PlatformSelectorProps) {
  // Convert accounts object to array of [platform, accounts] entries
  const platformEntries = Object.entries(accounts);

  // Auto-select first default account if nothing selected
  if (selectedAccountId === null && platformEntries.length > 0) {
    // Find first default account across all platforms
    for (const [, platformAccounts] of platformEntries) {
      const defaultAccount = platformAccounts.find((acc) => acc.is_default);
      if (defaultAccount) {
        onAccountSelect(defaultAccount.id);
        break;
      }
    }

    // If no default found, select first account
    if (selectedAccountId === null && platformEntries[0][1].length > 0) {
      onAccountSelect(platformEntries[0][1][0].id);
    }
  }

  // Empty state
  if (platformEntries.length === 0) {
    return (
      <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No social media accounts connected</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Connect an account to start posting
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Platform Groups */}
      {platformEntries.map(([platform, platformAccounts]) => {
        const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];

        return (
          <div key={platform} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Platform Header */}
            <div className={`${config.color} px-4 py-2 text-white flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.icon}</span>
                <span className="font-medium">{config.name}</span>
                <span className="text-xs opacity-75">({platformAccounts.length} account{platformAccounts.length !== 1 ? 's' : ''})</span>
              </div>
            </div>

            {/* Account List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {platformAccounts.map((account) => {
                const isSelected = account.id === selectedAccountId;
                const displayName = account.nickname || account.name || account.username;

                return (
                  <label
                    key={account.id}
                    className={`
                      flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-l-transparent'
                      }
                    `}
                  >
                    {/* Radio Button */}
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="social_account_id"
                        value={account.id}
                        checked={isSelected}
                        onChange={() => onAccountSelect(account.id)}
                        className="sr-only"
                      />
                      <div
                        className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {account.avatar_url ? (
                        <img
                          src={account.avatar_url}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500 dark:text-gray-400 text-lg">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Account Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                          {displayName}
                        </p>

                        {/* Default Badge */}
                        {account.is_default && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Default
                          </span>
                        )}
                      </div>

                      {/* Username (if different from display name) */}
                      {account.nickname && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          @{account.username}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Select the account you want to post to. The post will be published to this account only.
      </p>
    </div>
  );
}
