import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import ConsentBanner from './components/consent/ConsentBanner';
import PageLoader from './components/page-loader';

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

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title}  ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <PageLoader />
                <App {...props} />
                <ConsentBanner />
            </>,
        );
    },
    progress: false, // Using custom PageLoader instead
});

// This will set light / dark mode on load...
initializeTheme();
