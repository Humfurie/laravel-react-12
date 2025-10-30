import React from 'react';
import { RiArrowRightDoubleLine } from 'react-icons/ri';

interface SectionTitleProps {
    title: string;
    link?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, link }) => {
    const firstLetter = title.charAt(0);
    const restOfTitle = title.slice(1);

    const content = (
        <span className="flex items-center gap-2 text-[24px] sm:text-[28px] md:text-[34px] lg:text-[44px]">
            <span>
                <span className="text-brand-orange">{firstLetter}</span>
                {restOfTitle}
            </span>
            {link && <RiArrowRightDoubleLine />}
        </span>
    );

    return link ? (
        <h2 className="text-brand-gray hover:text-brand-gray/80 w-fit cursor-pointer pb-[38px] font-bold transition-all duration-200 hover:scale-[1.02]">
            <a href={link}>{content}</a>
        </h2>
    ) : (
        <h2 className="text-brand-gray flex w-full items-center justify-center pb-[38px] text-[24px] font-bold sm:text-[28px] md:text-[34px] lg:text-[44px]">
            {content}
        </h2>
    );
};

export default SectionTitle;
