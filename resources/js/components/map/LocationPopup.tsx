import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { BlogLocation, LocationImage } from '@/types';

interface LocationPopupProps {
    location: BlogLocation;
    number: number;
}

export function LocationPopup({ location, number }: LocationPopupProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = location.images || [];
    const hasImages = images.length > 0;
    const hasMultipleImages = images.length > 1;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="location-popup">
            {/* Image Gallery */}
            {hasImages && (
                <div className="relative">
                    <img
                        src={images[currentImageIndex].url}
                        alt={`${location.title} - Image ${currentImageIndex + 1}`}
                        className="h-40 w-full object-cover"
                    />

                    {/* Image navigation */}
                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>

                            {/* Image indicators */}
                            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                                {images.map((_: LocationImage, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                        className={`h-2 w-2 rounded-full transition-colors ${
                                            idx === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                        aria-label={`Go to image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Location number badge */}
                    <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shadow">
                        {number}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-3">
                {/* Title with number if no image */}
                <div className="flex items-start gap-2">
                    {!hasImages && (
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                            {number}
                        </div>
                    )}
                    <h3 className="text-base leading-tight font-semibold text-gray-900">{location.title}</h3>
                </div>

                {/* Address */}
                {location.address && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{location.address}</span>
                    </div>
                )}

                {/* Description */}
                {location.description && <p className="mt-2 text-sm leading-relaxed text-gray-600">{location.description}</p>}
            </div>
        </div>
    );
}
