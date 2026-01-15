import { CATEGORIES, svgs } from '@/components/svgs';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

export const SkillSection = () => {
    const [activeCategory, setActiveCategory] = useState('all');

    // Derive filtered skills directly with useMemo - avoids extra render cycle from useState + useEffect
    const filteredSkills = useMemo(
        () => (activeCategory === 'all' ? svgs : svgs.filter((skill) => skill.category === activeCategory)),
        [activeCategory],
    );

    return (
        <section className="h-full w-full bg-gray-50">
            <div className="primary-container py-[40px] max-xl:px-[20px] md:py-[80px]">
                <div className="flex h-full w-full flex-col">
                    <h2 className="pb-[30px] text-center text-[30px] font-bold text-black sm:text-left md:text-[45px]">
                        <span className="text-orange-600">K</span>nowledgeable in
                    </h2>

                    {/* Mobile-optimized filter dropdown for smaller screens */}
                    <div className="mb-5 block sm:hidden">
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                            <option value="all">All Skills</option>
                            {Object.values(CATEGORIES).map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Desktop filter tabs - hidden on mobile */}
                    <div className="mb-8 hidden flex-wrap justify-center gap-3 sm:flex sm:justify-start">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                activeCategory === 'all'
                                    ? 'bg-primary-orange text-orange-600 shadow-md'
                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            All Skills
                        </button>
                        {Object.values(CATEGORIES).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                    activeCategory === category
                                        ? 'bg-primary-orange text-orange-600 shadow-md'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Skills Grid with responsive classes and white backgrounds */}
                    <motion.div layout className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 md:grid-cols-3 md:gap-[35px] lg:grid-cols-4">
                        <AnimatePresence>
                            {filteredSkills.map((skill) => (
                                <motion.div
                                    key={skill.name}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{
                                        scale: 1.03,
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    }}
                                    className="flex min-h-[150px] items-center justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-md sm:min-h-[180px] sm:p-6"
                                >
                                    <div className="flex h-full w-full flex-col items-center justify-between gap-y-[15px]">
                                        <div className="my-2 flex flex-1 items-center justify-center">{skill.icon}</div>

                                        <span className="text-center text-[14px] text-gray-500 capitalize">{skill.name}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty state when no skills in category */}
                    {filteredSkills.length === 0 && (
                        <div className="rounded-xl border border-gray-100 bg-white p-8 py-10 text-center text-gray-500 shadow-md">
                            <p className="text-lg">No skills found in this category</p>
                            <button onClick={() => setActiveCategory('all')} className="text-primary-orange mt-4 hover:underline">
                                View all skills
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
