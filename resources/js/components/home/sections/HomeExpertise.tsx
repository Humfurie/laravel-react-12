import CategoryDropdown from '@/components/global/CategoryDropdown';
import SectionTitle from '@/components/global/SectionTitle';
import { MotionStagger, MotionItem } from '@/components/ui/motion';
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CategoryData {
    name: string;
    slug: string;
}

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

// Separate category data
const categoriesData: CategoryData[] = [
    { name: 'Backend', slug: 'be' },
    { name: 'Frontend', slug: 'fe' },
    { name: 'Tools & DevOps', slug: 'td' },
];

// Category slugs array - defined once at module level
const CATEGORY_SLUGS = ['all', ...categoriesData.map((cat) => cat.slug)];

// Category name lookup - pure function at module level
const getCategoryName = (slug: string) => categoriesData.find((cat) => cat.slug === slug)?.name ?? slug;

const HomeExpertise: React.FC<HomeExpertiseProps> = ({ expertises = [] }) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayedData, setDisplayedData] = useState(expertises);
    const isFirstRender = useRef(true);

    // Memoize filter function to avoid recreation on every render
    const getFilteredData = useCallback(
        (category: string) => (category === 'all' ? expertises : expertises.filter((item) => item.category_slug === category)),
        [expertises],
    );

    const handleCategoryChange = (category: string) => {
        if (category === activeCategory) return;

        // Start fade out
        setIsTransitioning(true);

        // After fade out, update data and fade in
        setTimeout(() => {
            setActiveCategory(category);
            setDisplayedData(getFilteredData(category));
            // Small delay before fade in for smooth transition
            requestAnimationFrame(() => {
                setIsTransitioning(false);
            });
        }, 150);
    };

    // Initialize displayed data
    useEffect(() => {
        if (isFirstRender.current) {
            setDisplayedData(expertises);
            isFirstRender.current = false;
        }
    }, [expertises]);

    return (
        <section className="home-expertise bg-brand-white py-[40px] md:py-[80px] dark:bg-gray-900">
            <div className="primary-container">
                <SectionTitle title="Expertise" />

                {/* selection */}
                <div className="pb-[16px] md:pb-[24px]">
                    <CategoryDropdown
                        categories={CATEGORY_SLUGS}
                        getCategoryName={getCategoryName}
                        activeCategory={activeCategory}
                        setActiveCategory={handleCategoryChange}
                    />
                </div>

                {/* Grid with stagger animation */}
                <MotionStagger
                    key={activeCategory}
                    staggerDelay={0.05}
                    className={`grid grid-cols-3 justify-center gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 md:gap-6 lg:grid-cols-6 transition-opacity duration-200 ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    {displayedData.map((item) => (
                        <MotionItem
                            key={item.id}
                            variant="scaleUp"
                            className="flex flex-col items-center text-center"
                        >
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="bg-brand-white hs-shadow mb-2 h-[50px] w-[50px] rounded-[14px] object-contain p-1.5 transition-transform duration-200 hover:scale-110 sm:h-[80px] sm:w-[80px] sm:rounded-[18px] sm:p-2 md:h-[100px] md:w-[100px] dark:bg-gray-800"
                                width={100}
                                height={100}
                                loading="lazy"
                            />
                        </MotionItem>
                    ))}
                </MotionStagger>
            </div>
        </section>
    );
};

export default HomeExpertise;
