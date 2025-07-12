import React from 'react';

interface SectionTitleProps {
    title: string;
    icon?: React.ReactNode;
    link?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, icon, link }) => {
    const firstLetter = title.charAt(0);
    const restOfTitle = title.slice(1);

    return (
        <h2 className={`w-fit pb-[38px] text-muted-black font-bold  text-muted-black ${link ? "hover:text-muted-black/80 hover:scale-102 transition-all duration-200 cursor-pointer" : ""}`}>
            <a href={link} className="flex items-center gap-2 text-[24px] sm:text-[28px] md:text-[34px] lg:text-[44px]">
                <span>
                    <span className="text-brand-orange">{firstLetter}</span>
                    {restOfTitle}
                </span>
                {icon ? icon : ''}
            </a>
        </h2>
    );
};

export default SectionTitle;
