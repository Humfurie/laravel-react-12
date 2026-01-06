import AdBanner from './AdBanner';

interface StickyAdProps {
    adSlot?: string;
    adClient?: string;
    testMode?: boolean;
    position?: 'left' | 'right';
}

/**
 * StickyAd Component
 *
 * A sidebar ad that sticks to the viewport while scrolling
 */
export default function StickyAd({ adSlot, adClient, testMode = true }: StickyAdProps) {
    // Don't render if no ad client or slot configured
    if (!adClient || !adSlot) {
        return null;
    }

    return (
        <div className="hidden lg:block">
            <div className="sticky top-20">
                <AdBanner
                    adSlot={adSlot}
                    adClient={adClient}
                    adFormat="vertical"
                    testMode={testMode}
                    className="w-full"
                    style={{ minHeight: '600px', maxWidth: '300px' }}
                />
            </div>
        </div>
    );
}
