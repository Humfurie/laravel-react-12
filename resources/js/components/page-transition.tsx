import { router } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Check if current page is an admin page
    const isAdminPage = () => {
        const path = window.location.pathname;
        return path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/settings');
    };

    useEffect(() => {
        // Skip transitions for admin pages
        if (isAdminPage()) {
            return;
        }

        const handleStart = () => {
            setIsTransitioning(true);
        };

        const handleFinish = () => {
            // Small delay to ensure smooth transition
            requestAnimationFrame(() => {
                setIsTransitioning(false);
            });
        };

        const removeStart = router.on('start', handleStart);
        const removeFinish = router.on('finish', handleFinish);

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Don't apply transitions to admin pages
    if (isAdminPage()) {
        return <>{children}</>;
    }

    return (
        <div
            className={`transition-all duration-300 ease-out will-change-[transform,opacity,filter] ${
                isTransitioning ? 'scale-[0.97] opacity-0 blur-md' : 'blur-0 scale-100 opacity-100'
            }`}
            style={{ transformOrigin: 'center center' }}
        >
            {children}
        </div>
    );
}
