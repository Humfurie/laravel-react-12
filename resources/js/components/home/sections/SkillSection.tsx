import { AnimatePresence, motion } from 'framer-motion';
import {svgs, CATEGORIES} from "@/components/svgs";
import { JSX, useEffect, useState } from 'react';



export const SkillSection = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [filteredSkills, setFilteredSkills] = useState(svgs);

    // Update filtered skills when category changes
    useEffect(() => {
        if (activeCategory === 'all') {
            setFilteredSkills(svgs);
        } else {
            setFilteredSkills(svgs.filter(skill => skill.category === activeCategory));
        }
    }, [activeCategory]);

    return (
        <section className="h-full w-full bg-gradient-to-br from-muted-white to-muted-teal py-8">
            <div className="primary-container max-xl:px-[20px] py-[40px] md:py-[80px]">
                <div className="flex flex-col h-full w-full">
                    <h2 className="pb-[30px] text-center sm:text-left text-[30px] text-brand-black font-bold md:text-[45px]">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-orange to-brand-gold">K</span>nowledgeable in
                    </h2>

                    {/* Mobile-optimized filter dropdown for smaller screens */}
                    <div className="block sm:hidden mb-5">
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="w-full p-3 bg-white border-l-4 border-brand-orange rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
                        >
                            <option value="all">All Skills</option>
                            {Object.values(CATEGORIES).map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Desktop filter tabs - hidden on mobile */}
                    <div className="hidden sm:flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${activeCategory === 'all'
                                ? 'bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            All Skills
                        </button>
                        {Object.values(CATEGORIES).map((category, index) => {
                            // Alternating gradient colors for each category
                            const gradients = [
                                'from-brand-orange to-brand-gold',
                                'from-brand-teal to-blue-500',
                                'from-brand-purple to-pink-500',
                                'from-green-500 to-brand-teal'
                            ];
                            const gradient = gradients[index % gradients.length];

                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                      ${activeCategory === category
                                        ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>

                    {/* Skills Grid with responsive classes and improved styling */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[15px] md:gap-[35px]"
                    >
                        <AnimatePresence>
                            {filteredSkills.map((skill, index) => {
                                // Create a pattern of different card styles
                                const cardStyles = [
                                    "bg-white border-l-4 border-brand-orange",
                                    "bg-white border-l-4 border-brand-gold",
                                    "bg-white border-l-4 border-brand-teal",
                                    "bg-white border-l-4 border-brand-purple"
                                ];
                                const cardStyle = cardStyles[index % cardStyles.length];

                                return (
                                    <motion.div
                                        key={skill.name}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{
                                            scale: 1.03,
                                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                        }}
                                        className={`${cardStyle} shadow-lg rounded-xl flex justify-center items-center p-4 sm:p-6 min-h-[150px] sm:min-h-[180px] transition-all duration-300`}
                                    >
                                        <div className="flex flex-col justify-between items-center gap-y-[15px] h-full w-full">
                                            <div className="flex-1 flex items-center justify-center my-2">
                                                {skill.icon}
                                            </div>

                                            <span className="text-[14px] font-medium text-gray-700 text-center capitalize">
                                                {skill.name}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {/* Empty state when no skills in category */}
                    {filteredSkills.length === 0 && (
                        <div className="text-center py-10 text-gray-600 bg-white rounded-xl shadow-lg border-l-4 border-brand-orange p-8">
                            <p className="text-lg font-medium">No skills found in this category</p>
                            <button
                                onClick={() => setActiveCategory('all')}
                                className="mt-4 px-4 py-2 bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-full hover:shadow-lg transition-all duration-300"
                            >
                                View all skills
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );


}
