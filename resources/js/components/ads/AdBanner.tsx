import { useEffect, useRef } from 'react';

interface AdBannerProps {
    /**
     * Ad slot ID (e.g., Google AdSense slot ID)
     */
    adSlot?: string;
    /**
     * Ad client ID (e.g., Google AdSense client ID like "ca-pub-XXXXXXXXXXXXXXXX")
     */
    adClient?: string;
    /**
     * Ad format (auto, rectangle, horizontal, vertical)
     */
    adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    /**
     * Ad layout (for responsive ads)
     */
    adLayout?: string;
    /**
     * Ad layout key (for responsive ads)
     */
    adLayoutKey?: string;
    /**
     * Custom style for the ad container
     */
    style?: React.CSSProperties;
    /**
     * Custom class name
     */
    className?: string;
    /**
     * Test mode - shows placeholder instead of real ad
     */
    testMode?: boolean;
}

/**
 * AdBanner Component
 *
 * For Google AdSense:
 * 1. Add AdSense script to your HTML head (in app.blade.php):
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
 *
 * 2. Use the component:
 *    <AdBanner adClient="ca-pub-XXXXXXXXXXXXXXXX" adSlot="1234567890" adFormat="auto" />
 *
 * For other ad networks (like custom banner ads):
 * - Set testMode={false} and use the component as a placeholder
 * - Replace the content with your ad network's code
 */
export default function AdBanner({
    adSlot,
    adClient,
    adFormat = 'auto',
    adLayout,
    adLayoutKey,
    style,
    className = '',
    testMode = true,
}: AdBannerProps) {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        if (!testMode && adClient && adSlot) {
            try {
                // Push ad to AdSense
                interface WindowWithAdsbygoogle extends Window {
                    adsbygoogle?: Array<Record<string, unknown>>;
                }
                ((window as WindowWithAdsbygoogle).adsbygoogle = (window as WindowWithAdsbygoogle).adsbygoogle || []).push({});
            } catch (error) {
                console.error('AdSense error:', error);
            }
        }
    }, [testMode, adClient, adSlot]);

    // Don't render anything if no ad client or slot configured
    if (!adClient || !adSlot) {
        return null;
    }

    // Test mode - show placeholder (only if both client and slot exist)
    if (testMode) {
        return (
            <div
                className={`flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 ${className}`}
                style={style || { minHeight: '250px' }}
            >
                <div className="text-center">
                    <div className="mb-2 text-sm font-semibold text-gray-400">Advertisement</div>
                    <div className="text-xs text-gray-400">
                        {adFormat} • {adSlot || 'Test Mode'}
                    </div>
                </div>
            </div>
        );
    }

    // Production mode - Google AdSense
    if (adClient && adSlot) {
        return (
            <div className={className} style={style}>
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client={adClient}
                    data-ad-slot={adSlot}
                    data-ad-format={adFormat}
                    data-ad-layout={adLayout}
                    data-ad-layout-key={adLayoutKey}
                    data-full-width-responsive="true"
                />
            </div>
        );
    }

    // Fallback - empty container for custom ad integration
    return (
        <div className={`ad-container ${className}`} style={style} data-ad-slot={adSlot}>
            {/* Custom ad network code goes here */}
        </div>
    );
}
