import { Hash, X } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

/**
 * HashtagInput Props Interface
 *
 * Props for controlling the HashtagInput component behavior
 */
interface HashtagInputProps {
  /** Array of hashtag strings (without # prefix) */
  value: string[];
  /** Callback fired when hashtags change */
  onChange: (hashtags: string[]) => void;
  /** Maximum number of hashtags allowed */
  maxHashtags?: number;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * HashtagInput Component
 *
 * A tag-style input component for adding and managing hashtags with:
 * - Tag-based UI with individual remove buttons
 * - Keyboard navigation (Enter to add, Backspace to remove last)
 * - Automatic # prefix removal
 * - Character validation (alphanumeric and underscore only)
 * - Maximum hashtag limit with visual feedback
 * - Dark mode support
 * - Accessible with proper ARIA labels
 *
 * Features:
 * - Type a hashtag and press Enter to add it
 * - Click X button on a tag to remove it
 * - Press Backspace on empty input to remove last tag
 * - Automatically removes # prefix if user types it
 * - Validates characters (only letters, numbers, underscores)
 * - Shows character count and limit
 */
export default function HashtagInput({
  value,
  onChange,
  maxHashtags = 30,
  placeholder = 'Add hashtags (press Enter)...',
  disabled = false,
  className = '',
}: HashtagInputProps) {
  // State for the current input value
  const [inputValue, setInputValue] = useState('');

  /**
   * Validate hashtag format
   *
   * Only allows alphanumeric characters and underscores
   */
  const isValidHashtag = (hashtag: string): boolean => {
    return /^[a-zA-Z0-9_]+$/.test(hashtag);
  };

  /**
   * Add a new hashtag
   *
   * Validates and adds the hashtag to the list if it passes all checks
   */
  const addHashtag = (hashtag: string) => {
    // Remove # prefix if present
    const cleanedHashtag = hashtag.replace(/^#/, '').trim();

    // Validate
    if (!cleanedHashtag) return;
    if (!isValidHashtag(cleanedHashtag)) {
      // Could show error toast here
      return;
    }
    if (value.includes(cleanedHashtag)) {
      // Hashtag already exists
      return;
    }
    if (value.length >= maxHashtags) {
      // Maximum hashtags reached
      return;
    }

    // Add the hashtag
    onChange([...value, cleanedHashtag]);
    setInputValue('');
  };

  /**
   * Remove a hashtag by index
   */
  const removeHashtag = (index: number) => {
    const newHashtags = [...value];
    newHashtags.splice(index, 1);
    onChange(newHashtags);
  };

  /**
   * Handle keyboard events
   *
   * - Enter: Add current input as hashtag
   * - Backspace: Remove last hashtag if input is empty
   * - Comma/Space: Add current input as hashtag (optional separators)
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault();
      removeHashtag(value.length - 1);
    } else if ((e.key === ',' || e.key === ' ') && inputValue) {
      e.preventDefault();
      addHashtag(inputValue);
    }
  };

  /**
   * Handle input change
   *
   * Filter out invalid characters as user types
   */
  const handleInputChange = (newValue: string) => {
    // Remove # prefix automatically
    let cleaned = newValue.replace(/^#/, '');

    // Only allow valid characters
    cleaned = cleaned.replace(/[^a-zA-Z0-9_]/g, '');

    setInputValue(cleaned);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Input Container */}
      <div
        className={`
          min-h-[42px] flex flex-wrap items-center gap-2 px-3 py-2
          border rounded-lg transition-colors
          ${disabled
            ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed'
            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
          }
        `}
      >
        {/* Hashtag Tags */}
        {value.map((hashtag, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
          >
            <Hash className="w-3 h-3" />
            <span>{hashtag}</span>
            <button
              type="button"
              onClick={() => removeHashtag(index)}
              disabled={disabled}
              className="ml-1 hover:text-blue-900 dark:hover:text-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Remove ${hashtag} hashtag`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || value.length >= maxHashtags}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm disabled:cursor-not-allowed"
          aria-label="Add hashtag"
        />
      </div>

      {/* Helper Text and Counter */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {/* Instructions */}
          <span>Press Enter to add hashtags</span>

          {/* Validation Hint */}
          {inputValue && !isValidHashtag(inputValue) && (
            <span className="text-red-500 dark:text-red-400">Only letters, numbers, and underscores allowed</span>
          )}
        </div>

        {/* Counter */}
        <span className={value.length >= maxHashtags ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}>
          {value.length} / {maxHashtags}
        </span>
      </div>
    </div>
  );
}
