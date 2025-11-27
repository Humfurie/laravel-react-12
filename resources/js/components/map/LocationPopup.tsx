import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { BlogLocation } from '@/types';

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
                        className="w-full h-40 object-cover"
                    />

                    {/* Image navigation */}
                    {hasMultipleImages && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {/* Image indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            idx === currentImageIndex
                                                ? 'bg-white'
                                                : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                        aria-label={`Go to image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Location number badge */}
                    <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow">
                        {number}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-3">
                {/* Title with number if no image */}
                <div className="flex items-start gap-2">
                    {!hasImages && (
                        <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {number}
                        </div>
                    )}
                    <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {location.title}
                    </h3>
                </div>

                {/* Address */}
                {location.address && (
                    <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{location.address}</span>
                    </div>
                )}

                {/* Description */}
                {location.description && (
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                        {location.description}
                    </p>
                )}
            </div>
        </div>
    );
}
