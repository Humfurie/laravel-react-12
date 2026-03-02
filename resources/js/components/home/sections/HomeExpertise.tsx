import SectionTitle from '@/components/global/SectionTitle';
import { MotionStagger, MotionItem } from '@/components/ui/motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ExpertiseData {
    id: number;
    name: string;
    image: string;
    image_url: string;
    category_slug: string;
    order: number;
    is_active: boolean;
}

interface HomeExpertiseProps {
    expertises?: ExpertiseData[];
}

// Filter categories
const FILTERS = [
    { label: 'All', slug: 'all' },
    { label: 'Backend', slug: 'be' },
    { label: 'Frontend', slug: 'fe' },
    { label: 'Tools & DevOps', slug: 'td' },
];

const HomeExpertise: React.FC<HomeExpertiseProps> = ({ expertises = [] }) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayedData, setDisplayedData] = useState(expertises);
    const isFirstRender = useRef(true);

    const getFilteredData = useCallback(
        (category: string) => (category === 'all' ? expertises : expertises.filter((item) => item.category_slug === category)),
        [expertises],
    );

    const handleCategoryChange = (category: string) => {
        if (category === activeCategory) return;

        setIsTransitioning(true);

        setTimeout(() => {
            setActiveCategory(category);
            setDisplayedData(getFilteredData(category));
            requestAnimationFrame(() => {
                setIsTransitioning(false);
            });
        }, 150);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            setDisplayedData(expertises);
            isFirstRender.current = false;
        }
    }, [expertises]);

    return (
        <section className="bg-[#F3F1EC] py-[clamp(80px,12vw,160px)] dark:bg-[#0F1A15]">
            <div className="primary-container">
                <SectionTitle title="Expertise" heading="Technologies I work with" />

                {/* Pill-shaped filter buttons */}
                <div className="mb-[clamp(36px,5vw,56px)] flex flex-wrap gap-2.5">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.slug}
                            onClick={() => handleCategoryChange(filter.slug)}
                            className={`rounded-full border px-5 py-2 text-[0.85rem] font-medium transition-all duration-250 ${
                                activeCategory === filter.slug
                                    ? 'border-[#1B3D2F] bg-[#1B3D2F] text-white dark:border-[#5AAF7E] dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                    : 'border-[#E5E4E0] bg-white text-[#6B6B63] hover:border-[#2A5E44] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Grid with icon + name */}
                <MotionStagger
                    key={activeCategory}
                    staggerDelay={0.05}
                    className={`grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6 transition-opacity duration-200 ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    {displayedData.map((item) => (
                        <MotionItem
                            key={item.id}
                            variant="scaleUp"
                            className="flex flex-col items-center gap-3 rounded-[14px] border border-[#E5E4E0] bg-white px-3 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C89E] hover:shadow-md dark:border-[#2A4A3A] dark:bg-[#162820] dark:hover:border-[#5AAF7E]"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl">
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="h-14 w-14 rounded-xl object-contain"
                                    width={56}
                                    height={56}
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-center text-[0.8rem] font-medium leading-tight text-[#1A1A1A] transition-colors group-hover:text-[#1B3D2F] dark:text-[#E8E6E1]">
                                {item.name}
                            </span>
                        </MotionItem>
                    ))}
                </MotionStagger>
            </div>
        </section>
    );
};

export default HomeExpertise;
