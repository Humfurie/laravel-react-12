import React, { useState } from 'react';
import { MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";

interface CategoryDropdownProps {
    categories: string[];
    getCategoryName: (slug: string) => string;
    activeCategory: string;
    setActiveCategory: (value: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    categories,
    getCategoryName,
    activeCategory,
    setActiveCategory,
}) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile dropdown */}
            <div className="relative w-full md:hidden mb-4">
                <button
                    className="w-full px-4 py-2 border rounded-[16px] text-brand-black border-muted-black/30 bg-white text-left cursor-pointer flex items-center justify-between"
                    onClick={() => setOpen(!open)}
                >
                    <span>{activeCategory === 'all' ? 'All' : getCategoryName(activeCategory)}</span>
                    <span className="ml-2 text-muted-black">
                        {open ? <MdKeyboardArrowUp /> : <MdOutlineKeyboardArrowDown />}
                    </span>
                </button>


                {open && (
                    <ul className="absolute left-0 z-10 mt-2 w-full bg-white rounded-[16px] shadow-lg overflow-hidden">
                        {categories.map((category) => (
                            <li
                                key={category}
                                onClick={() => {
                                    setActiveCategory(category);
                                    setOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer transition-colors ${activeCategory === category
                                    ? 'bg-brand-orange text-white'
                                    : 'hover:bg-muted-black/5'
                                    }`}
                            >
                                {category === 'all' ? 'All' : getCategoryName(category)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Desktop inline buttons */}
            <div className="hidden md:flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full border transition-all duration-200 ${activeCategory === category
                            ? 'bg-brand-orange text-white'
                            : 'bg-white text-muted-black border-muted-black/20 hover:bg-muted-black/5'
                            }`}
                    >
                        {category === 'all' ? 'All' : getCategoryName(category)}
                    </button>
                ))}
            </div>
        </>
    );
};

export default CategoryDropdown;
