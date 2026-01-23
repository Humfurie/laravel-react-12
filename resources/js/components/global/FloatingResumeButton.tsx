import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FloatingResumeButtonProps {
    resumeUrl: string | null;
    ctaSectionId?: string;
}

const FloatingResumeButton = ({ resumeUrl, ctaSectionId = 'cta-section' }: FloatingResumeButtonProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const ctaSection = document.getElementById(ctaSectionId);
        if (!ctaSection) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(!entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(ctaSection);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [ctaSectionId]);

    if (!resumeUrl) return null;

    return (
        <a
            href={resumeUrl}
            download
            className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-xl md:px-5 md:py-3 ${
                isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
            }`}
        >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Resume</span>
        </a>
    );
};

export default FloatingResumeButton;
