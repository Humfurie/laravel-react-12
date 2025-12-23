import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface MapPickerProps {
    latitude?: number | null;
    longitude?: number | null;
    onChange: (lat: number, lng: number) => void;
    height?: string;
}

// Component to handle click events
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e: { latlng: { lat: number; lng: number } }) => {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// Component to center map on coordinates
function MapCenterer({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);

    return null;
}

// Wrapper component for SSR safety
export function MapPicker(props: MapPickerProps) {
    const [MapComponent, setMapComponent] = useState<React.ComponentType<MapPickerProps> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Dynamic import to avoid SSR issues
        setMapComponent(() => MapPickerInner);
        setIsLoading(false);
    }, []);

    if (isLoading || !MapComponent) {
        return (
            <div
                className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
                style={{ height: props.height || '300px' }}
            >
                <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
            </div>
        );
    }

    return <MapComponent {...props} />;
}

function MapPickerInner({ latitude, longitude, onChange, height = '300px' }: MapPickerProps) {
    // Default center (can be user's location or a default)
    const defaultCenter: [number, number] = [14.5995, 120.9842]; // Manila, Philippines
    const center: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter;
    const hasPosition = latitude !== null && longitude !== null && latitude && longitude;

    // Cast components to any to work around react-leaflet v5 type incompatibilities
    // @ts-ignore - @ts-expect-error react-leaflet types incompatible with React 19
    const MapContainerAny = MapContainer as any;
    // @ts-ignore - @ts-expect-error react-leaflet types incompatible with React 19
    const TileLayerAny = TileLayer as any;

    return (
        <div className="relative">
            <MapContainerAny
                center={center}
                zoom={hasPosition ? 15 : 5}
                style={{ height, width: '100%' }}
                className="rounded-lg border border-gray-200 dark:border-gray-700"
            >
                <TileLayerAny
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ClickHandler onChange={onChange} />

                {hasPosition && (
                    <>
                        <Marker position={[latitude!, longitude!]} />
                        <MapCenterer lat={latitude!} lng={longitude!} />
                    </>
                )}
            </MapContainerAny>

            {/* Instructions overlay */}
            {!hasPosition && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-lg bg-black/60 px-4 py-2 text-sm text-white">Click on the map to place a pin</div>
                </div>
            )}
        </div>
    );
}
