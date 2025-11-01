import AdSlot from './AdSlot';

interface AdBannerProps {
    adClient?: string;
    adSlot?: string;
    className?: string;
}

/**
 * AdBanner - Banner ad component wrapper
 * Displays a horizontal banner ad (728x90 or 970x90)
 */
export default function AdBanner({ adClient, adSlot, className }: AdBannerProps) {
    return <AdSlot type="banner" adClient={adClient} adSlot={adSlot} className={className} />;
}
