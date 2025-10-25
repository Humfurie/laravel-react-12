import CategoryDropdown from '@/components/global/CategoryDropdown';
import SectionTitle from '@/components/global/SectionTitle';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

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

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut' as const,
        },
    },
};

const HomeExpertise: React.FC<HomeExpertiseProps> = ({ expertises = [] }) => {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [key, setKey] = useState(0);

    const categories = ['all', ...categoriesData.map((cat) => cat.slug)];

    const filteredData = activeCategory === 'all' ? expertises : expertises.filter((item) => item.category_slug === activeCategory);

    const getCategoryName = (slug: string) => categoriesData.find((cat) => cat.slug === slug)?.name ?? slug;

    // Reset animation when category changes
    useEffect(() => {
        setKey((prevKey) => prevKey + 1);
    }, [activeCategory]);

    return (
        <section className="home-expertise bg-brand-white py-[40px] md:py-[80px]">
            <div className="primary-container">
                <SectionTitle title="Expertise" />

                {/* selection */}
                <div className="pb-[16px] md:pb-[24px]">
                    <CategoryDropdown
                        categories={categories}
                        getCategoryName={getCategoryName}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={key}
                        className={`grid grid-cols-3 justify-center gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6`}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                    >
                        {filteredData.map((item) => (
                            <motion.div
                                key={`${activeCategory}-${item.id}`}
                                className="flex flex-col items-center text-center"
                                variants={itemVariants}
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="bg-brand-white hs-shadow mb-2 h-[60px] w-[60px] rounded-[18px] object-contain p-2 sm:h-[80px] sm:w-[80px] md:h-[100px] md:w-[100px]"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
};

export default HomeExpertise;
