import React, { useState } from 'react';
import { MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from 'react-icons/md';

interface CategoryDropdownProps {
    categories: string[];
    getCategoryName: (slug: string) => string;
    activeCategory: string;
    setActiveCategory: (value: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ categories, getCategoryName, activeCategory, setActiveCategory }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Mobile dropdown */}
            <div className="relative mb-4 w-full md:hidden">
                <button
                    className="text-brand-black border-muted-black/30 flex w-full cursor-pointer items-center justify-between rounded-[16px] border bg-white px-4 py-2 text-left"
                    onClick={() => setOpen(!open)}
                >
                    <span>{activeCategory === 'all' ? 'All' : getCategoryName(activeCategory)}</span>
                    <span className="text-muted-black ml-2">{open ? <MdKeyboardArrowUp /> : <MdOutlineKeyboardArrowDown />}</span>
                </button>

                {open && (
                    <ul className="absolute left-0 z-10 mt-2 w-full overflow-hidden rounded-[16px] bg-white shadow-lg">
                        {categories.map((category) => (
                            <li
                                key={category}
                                onClick={() => {
                                    setActiveCategory(category);
                                    setOpen(false);
                                }}
                                className={`cursor-pointer px-4 py-2 transition-colors ${
                                    activeCategory === category ? 'bg-brand-orange text-white' : 'hover:bg-muted-black/5'
                                }`}
                            >
                                {category === 'all' ? 'All' : getCategoryName(category)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Desktop inline buttons */}
            <div className="mb-4 hidden flex-wrap gap-2 md:flex">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`rounded-full border px-4 py-2 transition-all duration-200 ${
                            activeCategory === category
                                ? 'bg-brand-orange text-white'
                                : 'text-muted-black border-muted-black/20 hover:bg-muted-black/5 bg-white'
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
