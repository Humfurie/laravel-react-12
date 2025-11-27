import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { TravelMap } from '@/components/map/TravelMap';
import { MapPin, AlertCircle } from 'lucide-react';
import type { BlogLocation } from '@/types';

export const TravelMapNodeComponent = ({ node, extension, selected }: NodeViewProps) => {
    const { locationIds, height } = node.attrs;
    const allLocations: BlogLocation[] = extension.options.locations || [];

    // Filter to specific locations if IDs provided, otherwise show all
    const displayLocations =
        locationIds && locationIds.length > 0
            ? allLocations.filter((loc: BlogLocation) => locationIds.includes(loc.id))
            : allLocations;

    const hasLocations = displayLocations.length > 0;

    return (
        <NodeViewWrapper
            className={`travel-map-node my-4 ${selected ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
            data-type="travel-map"
        >
            {hasLocations ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                    <TravelMap
                        locations={displayLocations}
                        height={height}
                        interactive={false} // Non-interactive in editor
                        showRoute={true}
                    />
                    <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>
                            {displayLocations.length} location{displayLocations.length !== 1 ? 's' : ''} on map
                        </span>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-600">No locations available</p>
                    <p className="mt-1 text-xs text-gray-500">
                        Add travel locations in the "Travel Locations" section below to display them on this map.
                    </p>
                </div>
            )}
        </NodeViewWrapper>
    );
};
