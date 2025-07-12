import CategoryDropdown from '@/components/global/CategoryDropdown';
import SectionTitle from '@/components/global/SectionTitle';
import React, { useState } from 'react';

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

const HomeExpertise: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const categories = ['all', ...categoriesData.map(cat => cat.slug)];

    const filteredData =
        activeCategory === 'all'
            ? expertiseData
            : expertiseData.filter(item => item.categorySlug === activeCategory);

    const getCategoryName = (slug: string) =>
        categoriesData.find(cat => cat.slug === slug)?.name ?? slug;

    return (
        <section className="home-expertise py-[40px] md:py-[80px] bg-brand-white">
            <div className="primary-container">
                <SectionTitle title="Expertise" />

                {/* selection */}
                <div className='pb-[16px] md:pb-[24px]'>
                    <CategoryDropdown
                        categories={categories}
                        getCategoryName={getCategoryName}
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                    />
                </div>

                <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 justify-center`}>
                    {filteredData.map((item, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center"
                        >
                            <img
                                src={item.logo}
                                alt={item.name}
                                className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] object-contain mb-2 p-2 bg-brand-white hs-shadow rounded-[18px]"
                            />
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
};

export default HomeExpertise;
