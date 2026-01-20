import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import ConsentBanner from './components/consent/ConsentBanner';
import PageLoader from './components/page-loader';
import PageTransition from './components/page-transition';

// Google Analytics page view tracking
interface GtagEventParams {
    [key: string]: string | number | boolean | undefined;
}

interface GtagConfigParams {
    send_page_view?: boolean;
    page_path?: string;
    page_location?: string;
    page_title?: string;
    [key: string]: string | number | boolean | undefined;
}

declare global {
    interface Window {
        gtag?: {
            (command: 'config', targetId: string, config?: GtagConfigParams): void;
            (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
            (command: 'set', params: Record<string, string | number | boolean | undefined>): void;
            (command: 'js', date: Date): void;
            (command: 'consent', action: string, params: { [key: string]: string }): void;
        };
    }
}

// Track page views on Inertia navigation
router.on('navigate', () => {
    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_location: window.location.href,
            page_path: window.location.pathname,
            page_title: document.title,
        });
    }
});

// Instant scroll to top on navigation (for public pages only)
router.on('navigate', () => {
    const path = window.location.pathname;
    const isAdminPage = path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/settings');

    if (!isAdminPage) {
        // Instant scroll - the blur transition makes it smooth
        window.scrollTo({ top: 0, behavior: 'instant' });
    }
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => {
        // Don't append suffix to auth pages or homepage (which has full title)
        if (
            title.startsWith('Log in') ||
            title.startsWith('Register') ||
            title.startsWith('Reset') ||
            title.startsWith('Forgot') ||
            title.startsWith('Humphrey Singculan')
        ) {
            return title;
        }
        return `${title} | Humphrey Singculan`;
    },
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <PageLoader />
                <PageTransition>
                    <App {...props} />
                </PageTransition>
                <ConsentBanner />
            </>,
        );
    },
    progress: false, // Using custom PageLoader instead
});

// This will set light / dark mode on load...
initializeTheme();
