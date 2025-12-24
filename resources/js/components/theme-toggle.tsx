import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
    variant?: 'icon-only' | 'with-label';
    className?: string;
}

export default function ThemeToggle({ variant = 'icon-only', className = '' }: ThemeToggleProps) {
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        updateAppearance(isDark ? 'light' : 'dark');
    };

    const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Show current mode, not the mode we're switching to
    const currentMode = isDark ? 'Dark' : 'Light';
    const targetMode = isDark ? 'Light' : 'Dark';

    if (variant === 'with-label') {
        return (
            <button
                onClick={toggleTheme}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-white/80 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-gray-700/80 dark:hover:text-orange-400 ${className}`}
                aria-label={`Switch to ${targetMode} mode`}
                title={`Current: ${currentMode} mode. Click to switch to ${targetMode} mode.`}
            >
                {isDark ? (
                    <>
                        <Moon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                        <span className="transition-all duration-200">Dark</span>
                    </>
                ) : (
                    <>
                        <Sun className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                        <span className="transition-all duration-200">Light</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`rounded-full p-2 text-gray-700 transition-all duration-200 hover:bg-white/80 hover:text-orange-600 active:scale-95 dark:text-gray-200 dark:hover:bg-gray-700/80 dark:hover:text-orange-400 ${className}`}
            aria-label={`Switch to ${targetMode} mode`}
            title={`Current: ${currentMode} mode. Click to switch to ${targetMode} mode.`}
        >
            {isDark ? (
                <Moon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            ) : (
                <Sun className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            )}
        </button>
    );
}
