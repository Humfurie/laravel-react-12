import { useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { TravelMap } from './TravelMap';
import type { BlogLocation } from '@/types';

interface BlogContentWithMapsProps {
    content: string;
    locations: BlogLocation[];
    className?: string;
}

/**
 * Renders blog content with hydrated travel maps.
 * Replaces [data-type="travel-map"] divs with interactive TravelMap components.
 */
export function BlogContentWithMaps({ content, locations, className }: BlogContentWithMapsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rootsRef = useRef<Map<HTMLElement, Root>>(new Map());

    useEffect(() => {
        if (!containerRef.current) return;

        // Find all travel map placeholders
        const mapContainers = containerRef.current.querySelectorAll<HTMLElement>('[data-type="travel-map"]');

        mapContainers.forEach((container) => {
            // Parse location IDs from data attribute
            const locationIdsAttr = container.getAttribute('data-location-ids');
            const locationIds: number[] = locationIdsAttr ? JSON.parse(locationIdsAttr) : [];
            const height = container.getAttribute('data-height') || '300px';

            // Filter locations based on IDs (empty = show all)
            const displayLocations = locationIds.length > 0 ? locations.filter((loc) => locationIds.includes(loc.id)) : locations;

            // Skip if no locations to display
            if (displayLocations.length === 0) {
                container.innerHTML = `
                    <div class="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                        <p class="text-sm text-gray-500">No travel locations available</p>
                    </div>
                `;
                return;
            }

            // Create React root if not exists
            if (!rootsRef.current.has(container)) {
                const root = createRoot(container);
                rootsRef.current.set(container, root);
            }

            // Render the map
            const root = rootsRef.current.get(container)!;
            root.render(
                <div className="travel-map-embed my-4 overflow-hidden rounded-lg shadow-md">
                    <TravelMap locations={displayLocations} height={height} interactive={true} showRoute={true} />
                </div>,
            );
        });

        // Cleanup function - capture ref value to avoid stale closure
        const roots = rootsRef.current;
        return () => {
            roots.forEach((root) => {
                root.unmount();
            });
            roots.clear();
        };
    }, [content, locations]);

    return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: content }} />;
}
