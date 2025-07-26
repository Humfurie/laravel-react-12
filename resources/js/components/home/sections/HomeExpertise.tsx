import CategoryDropdown from '@/components/global/CategoryDropdown';
import SectionTitle from '@/components/global/SectionTitle';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

interface CategoryData {
    name: string;
    slug: string;
}

interface ExpertiseData {
    name: string;
    logo: string;
    categorySlug: string; // reference by slug
}

// Separate category data
const categoriesData: CategoryData[] = [
    { name: 'Backend', slug: 'be' },
    { name: 'Frontend', slug: 'fe' },
    { name: 'Tools & DevOps', slug: 'td' },
];

// Your expertise items
const expertiseData: ExpertiseData[] = [
    {
        name: 'Laravel',
        logo: '/images/techstack/laravel.webp',
        categorySlug: 'be',
    },
    {
        name: 'Docker',
        logo: '/images/techstack/docker.webp',
        categorySlug: 'td',
    },
    {
        name: 'Ngnix',
        logo: '/images/techstack/ngnix.webp',
        categorySlug: 'td',
    },
    {
        name: 'API',
        logo: '/images/techstack/api.webp',
        categorySlug: 'td',
    },
    {
        name: 'React JS',
        logo: '/images/techstack/react.webp',
        categorySlug: 'fe',
    },
    {
        name: 'Tailwind CSS',
        logo: '/images/techstack/tailwind-css.webp',
        categorySlug: 'fe',
    },
    {
        name: 'Next.js',
        logo: '/images/techstack/next-js.webp',
        categorySlug: 'fe',
    },
    {
        name: 'GitHub',
        logo: '/images/techstack/github.webp',
        categorySlug: 'td',
    },
    {
        name: 'Postman',
        logo: '/images/techstack/postman.webp',
        categorySlug: 'td',
    },
    {
        name: 'Xampp',
        logo: '/images/techstack/xampp.webp',
        categorySlug: 'td',
    },
    {
        name: 'Git',
        logo: '/images/techstack/git.webp',
        categorySlug: 'td',
    },
    {
        name: 'Adonis JS',
        logo: '/images/techstack/adonis.webp',
        categorySlug: 'be',
    },
    {
        name: 'PHP',
        logo: '/images/techstack/php.webp',
        categorySlug: 'be',
    },
    {
        name: 'Filament',
        logo: '/images/techstack/filament.webp',
        categorySlug: 'be',
    },
    {
        name: 'MySQL',
        logo: '/images/techstack/mysql.webp',
        categorySlug: 'td',
    },
    {
        name: 'JavaScript',
        logo: '/images/techstack/javascript.webp',
        categorySlug: 'fe',
    },
    {
        name: 'HTML',
        logo: '/images/techstack/html.webp',
        categorySlug: 'fe',
    },
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

const HomeExpertise: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [key, setKey] = useState(0);

    const categories = ['all', ...categoriesData.map((cat) => cat.slug)];

    const filteredData = activeCategory === 'all' ? expertiseData : expertiseData.filter((item) => item.categorySlug === activeCategory);

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
                        {filteredData.map((item, index) => (
                            <motion.div key={`${activeCategory}-${index}`} className="flex flex-col items-center text-center" variants={itemVariants}>
                                <img
                                    src={item.logo}
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
