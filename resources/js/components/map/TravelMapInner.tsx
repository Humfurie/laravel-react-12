import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BlogLocation } from '@/types';
import { LocationPopup } from './LocationPopup';
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

interface TravelMapInnerProps {
    locations: BlogLocation[];
    height?: string;
    className?: string;
    interactive?: boolean;
    showRoute?: boolean;
    onLocationClick?: (location: BlogLocation) => void;
}

// Create numbered marker icon
function createNumberedIcon(number: number): L.DivIcon {
    return L.divIcon({
        className: 'custom-numbered-marker',
        html: `<div class="marker-pin">${number}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
}

// Component to handle map bounds fitting
function MapBoundsHandler({ locations }: { locations: BlogLocation[] }) {
    const map = useMap();
    const hasSetBounds = useRef(false);

    useEffect(() => {
        if (locations.length === 0 || hasSetBounds.current) return;

        const bounds = L.latLngBounds(
            locations.map((loc) => [loc.latitude, loc.longitude] as [number, number])
        );

        // Add padding and limit max zoom
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
        });

        hasSetBounds.current = true;
    }, [locations, map]);

    return null;
}

export function TravelMapInner({
    locations,
    height = '400px',
    className = '',
    interactive = true,
    showRoute = true,
    onLocationClick,
}: TravelMapInnerProps) {
    // Default center (will be overridden by bounds)
    const defaultCenter: [number, number] =
        locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : [0, 0];

    // Create route line coordinates (ordered by location.order)
    const routeCoordinates: [number, number][] = [...locations]
        .sort((a, b) => a.order - b.order)
        .map((loc) => [loc.latitude, loc.longitude]);

    return (
        <>
            <style>{`
                .custom-numbered-marker {
                    background: transparent;
                    border: none;
                }
                .marker-pin {
                    width: 32px;
                    height: 32px;
                    border-radius: 50% 50% 50% 0;
                    background: #f97316;
                    position: absolute;
                    transform: rotate(-45deg);
                    left: 50%;
                    top: 50%;
                    margin: -20px 0 0 -16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    border: 2px solid white;
                }
                .marker-pin::before {
                    content: attr(data-number);
                    transform: rotate(45deg);
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }
                .marker-pin {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .marker-pin::after {
                    content: '';
                    position: absolute;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #f97316;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                }
                .custom-numbered-marker .marker-pin {
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    text-align: center;
                    line-height: 32px;
                }
                .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .leaflet-popup-content {
                    margin: 0;
                    min-width: 280px;
                    max-width: 320px;
                }
            `}</style>
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={interactive}
                dragging={interactive}
                zoomControl={interactive}
                doubleClickZoom={interactive}
                style={{ height, width: '100%' }}
                className={`rounded-lg ${className}`}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBoundsHandler locations={locations} />

                {/* Route line connecting locations */}
                {showRoute && routeCoordinates.length > 1 && (
                    <Polyline
                        positions={routeCoordinates}
                        pathOptions={{
                            color: '#f97316',
                            weight: 3,
                            opacity: 0.7,
                            dashArray: '10, 10',
                        }}
                    />
                )}

                {/* Location markers */}
                {locations.map((location, index) => (
                    <Marker
                        key={location.id}
                        position={[location.latitude, location.longitude]}
                        icon={createNumberedIcon(index + 1)}
                        eventHandlers={{
                            click: () => onLocationClick?.(location),
                        }}
                    >
                        <Popup>
                            <LocationPopup location={location} number={index + 1} />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </>
    );
}
