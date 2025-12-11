import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PageLoader() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const startHandler = () => {
            setLoading(true);
            setProgress(0);
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

        const removeStart = router.on('start', () => {
            interval = startHandler();
        });

        const removeProgress = router.on('progress', (event) => {
            if (event.detail.progress?.percentage) {
                setProgress(event.detail.progress.percentage);
            }
        });

        const removeFinish = router.on('finish', () => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 300);
            if (interval) clearInterval(interval);
        });

        return () => {
            removeStart();
            removeProgress();
            removeFinish();
        };
    }, []);

    if (!loading) return null;

    return (
        <>
            {/* Top progress bar */}
            <div className="fixed inset-x-0 top-0 z-[100] h-1 bg-orange-100/50">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
                {/* Glow effect */}
                <div
                    className="absolute top-0 right-0 h-full w-20 bg-gradient-to-r from-transparent to-orange-400/50 blur-sm transition-all duration-300"
                    style={{ transform: `translateX(${progress < 100 ? '0' : '100%'})` }}
                />
            </div>

            {/* Center spinner for longer loads */}
            <div
                className={`fixed inset-0 z-[99] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity duration-300 dark:bg-gray-900/60 ${
                    progress > 50 ? 'opacity-100' : 'pointer-events-none opacity-0'
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
