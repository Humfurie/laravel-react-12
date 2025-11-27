import { useEffect, useState } from 'react';
import type { BlogLocation } from '@/types';

interface TravelMapProps {
    locations: BlogLocation[];
    height?: string;
    className?: string;
    interactive?: boolean;
    showRoute?: boolean;
    onLocationClick?: (location: BlogLocation) => void;
}

// Lazy load the actual map component to avoid SSR issues
export function TravelMap(props: TravelMapProps) {
    const [MapComponent, setMapComponent] = useState<React.ComponentType<TravelMapProps> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        import('./TravelMapInner').then((mod) => {
            setMapComponent(() => mod.TravelMapInner);
            setIsLoading(false);
        });
    }, []);

    if (isLoading || !MapComponent) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${props.className || ''}`}
                style={{ height: props.height || '400px' }}
            >
                <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
            </div>
        );
    }

    return <MapComponent {...props} />;
}
