import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PageLoader() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);

    // Check if current page is an admin page
    const isAdminPage = () => {
        const path = window.location.pathname;
        return path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/settings');
    };

    useEffect(() => {
        const startHandler = () => {
            setLoading(true);
            setProgress(0);
            setShowOverlay(false);
            // Animate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + Math.random() * 15;
                });
            }, 100);
            return interval;
        };

        let interval: ReturnType<typeof setInterval>;
        let overlayTimeout: ReturnType<typeof setTimeout>;

        const removeStart = router.on('start', (event) => {
            // Skip loader entirely for admin pages
            if (isAdminPage()) {
                return;
            }

            // Skip loader for form submissions (POST/PUT/PATCH/DELETE)
            // Only show for GET navigations (page transitions)
            const method = event.detail.visit.method;
            if (method !== 'get') {
                return;
            }

            interval = startHandler();
            // Only show overlay after 500ms for slow loads
            overlayTimeout = setTimeout(() => {
                setShowOverlay(true);
            }, 500);
        });

        const removeProgress = router.on('progress', (event) => {
            if (event.detail.progress?.percentage) {
                setProgress(event.detail.progress.percentage);
            }
        });

        const removeFinish = router.on('finish', () => {
            setProgress(100);
            // Wait for progress bar to complete, then fade out
            setTimeout(() => {
                setLoading(false);
                setShowOverlay(false);
                // Reset progress after fade out
                setTimeout(() => {
                    setProgress(0);
                }, 300);
            }, 200);
            if (interval) clearInterval(interval);
            if (overlayTimeout) clearTimeout(overlayTimeout);
        });

        return () => {
            removeStart();
            removeProgress();
            removeFinish();
            if (overlayTimeout) clearTimeout(overlayTimeout);
        };
    }, []);

    return (
        <>
            {/* Top progress bar */}
            <div
                className={`fixed inset-x-0 top-0 z-[100] h-1 bg-orange-100/50 transition-opacity duration-300 dark:bg-orange-900/30 ${
                    loading ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            >
                <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Glow effect */}
                <div
                    className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-orange-400/50 blur-sm transition-all duration-300"
                    style={{ transform: `translateX(${progress < 100 ? '0' : '100%'})` }}
                />
            </div>

            {/* Center spinner for longer loads - only shows after 500ms delay */}
            <div
                className={`fixed inset-0 z-[99] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity duration-300 dark:bg-gray-900/60 ${
                    showOverlay && progress > 30 ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
            >
                <div className="flex flex-col items-center gap-4">
                    {/* Animated logo/spinner */}
                    <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-6 w-6 animate-pulse rounded-full bg-orange-500/20" />
                        </div>
                    </div>
                    <p className="animate-pulse text-sm font-medium text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        </>
    );
}
