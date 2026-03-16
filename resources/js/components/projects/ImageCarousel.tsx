import type { ProjectImage } from '@/types/project';
import { useCallback, useEffect, useRef, useState } from 'react';

function getImageUrl(image: ProjectImage): string {
    return image.thumbnail_urls?.medium || image.url;
}

interface ImageCarouselProps {
    images: ProjectImage[];
    title: string;
    className?: string;
}

export function ImageCarousel({ images, title, className = '' }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRotation = useCallback(() => {
        if (images.length <= 1) return;
        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 3000);
    }, [images.length]);

    const stopRotation = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        startRotation();
        return stopRotation;
    }, [startRotation, stopRotation]);

    const handleMouseEnter = useCallback(() => stopRotation(), [stopRotation]);
    const handleMouseLeave = useCallback(() => startRotation(), [startRotation]);

    return (
        <div
            className={`relative overflow-hidden bg-[#F3F1EC] dark:bg-[#0F1A15] ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {images.map((image, index) => (
                <img
                    key={image.id}
                    src={getImageUrl(image)}
                    alt={`${title} - ${index + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                        index === activeIndex ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                    }`}
                    loading={index === 0 ? 'eager' : 'lazy'}
                />
            ))}

            {/* Dot indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, index) => (
                        <span
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                                index === activeIndex ? 'w-4 bg-white' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
