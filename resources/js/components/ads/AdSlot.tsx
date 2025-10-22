import { useEffect, useRef } from 'react';

interface AdSlotProps {
    /**
     * Placement type - determines ad size and format
     */
    type: 'banner' | 'sidebar' | 'in-content' | 'sticky-bottom' | 'between-posts';
    /**
     * Optional custom class names
     */
    className?: string;
    /**
     * Google AdSense client ID (e.g., "ca-pub-1234567890123456")
     */
    adClient?: string;
    /**
     * Google AdSense ad slot ID
     */
    adSlot?: string;
}

/**
 * Reusable Ad Component for Google AdSense and other ad networks
 *
 * Usage Examples:
 *
 * 1. Top Banner (728x90 or 970x90):
 *    <AdSlot type="banner" adClient="ca-pub-xxx" adSlot="xxx" />
 *
 * 2. Sidebar (300x250 or 300x600):
 *    <AdSlot type="sidebar" adClient="ca-pub-xxx" adSlot="xxx" />
 *
 * 3. In-Content (Responsive):
 *    <AdSlot type="in-content" adClient="ca-pub-xxx" adSlot="xxx" />
 *
 * 4. Between Blog Posts:
 *    <AdSlot type="between-posts" adClient="ca-pub-xxx" adSlot="xxx" />
 *
 * 5. Sticky Bottom Banner (Mobile):
 *    <AdSlot type="sticky-bottom" adClient="ca-pub-xxx" adSlot="xxx" />
 *
 * Setup Instructions:
 * 1. Sign up for Google AdSense at https://www.google.com/adsense
 * 2. Add the AdSense script to your app.blade.php:
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID"
 *            crossorigin="anonymous"></script>
 * 3. Replace adClient and adSlot props with your actual values
 * 4. For other ad networks (Mediavine, AdThrive), replace the ins element with their code
 */
export default function AdSlot({ type, className = '', adClient, adSlot }: AdSlotProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        // Initialize AdSense ads after component mounts
        if (adRef.current && window.adsbygoogle && adClient && adSlot) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error('AdSense error:', err);
            }
        }
    }, [adClient, adSlot]);

    // Don't render if no ad configuration provided
    if (!adClient || !adSlot) {
        return (
            <div className={`ad-placeholder ${getAdStyles(type)} ${className}`}>
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    <div className="text-center">
                        <p className="text-sm font-semibold">Ad Placement: {type}</p>
                        <p className="text-xs">Configure adClient and adSlot props</p>
                    </div>
                </div>
            </div>
        );
    }

    const adStyles = getAdStyles(type);

    return (
        <div className={`ad-container ${adStyles} ${className}`}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format={getAdFormat(type)}
                data-full-width-responsive={type === 'in-content' ? 'true' : 'false'}
            />
        </div>
    );
}

/**
 * Get CSS classes based on ad type
 */
function getAdStyles(type: AdSlotProps['type']): string {
    const baseStyles = 'my-8';

    switch (type) {
        case 'banner':
            return `${baseStyles} mx-auto max-w-screen-lg`;
        case 'sidebar':
            return `${baseStyles} w-[300px]`;
        case 'in-content':
            return `${baseStyles} max-w-full`;
        case 'between-posts':
            return `${baseStyles} mx-auto max-w-4xl`;
        case 'sticky-bottom':
            return 'fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg md:hidden';
        default:
            return baseStyles;
    }
}

/**
 * Get AdSense format based on ad type
 */
function getAdFormat(type: AdSlotProps['type']): string {
    switch (type) {
        case 'banner':
            return 'horizontal';
        case 'sidebar':
            return 'rectangle';
        case 'in-content':
            return 'auto';
        case 'between-posts':
            return 'fluid';
        case 'sticky-bottom':
            return 'horizontal';
        default:
            return 'auto';
    }
}

// TypeScript declaration for adsbygoogle
declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}
