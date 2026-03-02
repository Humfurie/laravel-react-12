import React from 'react';

interface SectionTitleProps {
    /** Uppercase section label text (e.g. "EXPERIENCE") */
    title: string;
    /** Optional larger display heading below the label */
    heading?: string;
    /** Optional description text below the heading */
    description?: string;
    /** Horizontal alignment */
    align?: 'left' | 'center';
    /** Optional link wrapping the heading */
    link?: string;
}

/**
 * Section title pattern from design system:
 * ── LABEL          (0.75rem, uppercase, green, orange line prefix)
 * Display Heading   (Cormorant Garamond, clamp 2-3.2rem, weight 300)
 * Description       (1rem, secondary text)
 */
const SectionTitle: React.FC<SectionTitleProps> = ({ title, heading, description, align = 'left', link }) => {
    const isCenter = align === 'center';

    return (
        <div className={`mb-10 ${isCenter ? 'text-center' : ''}`}>
            {/* Section label */}
            <div className={`section-label ${isCenter ? 'justify-center' : ''}`}>{title}</div>

            {/* Display heading */}
            {heading && (
                <h2 className="heading-display text-[clamp(2rem,4vw,3.2rem)]">
                    {link ? (
                        <a href={link} className="transition-colors hover:text-[#2A5E44] dark:hover:text-[#5AAF7E]">
                            {heading}
                        </a>
                    ) : (
                        heading
                    )}
                </h2>
            )}

            {/* Optional description */}
            {description && <p className="mt-2 max-w-[540px] text-base leading-relaxed text-[#6B6B63] dark:text-[#9E9E95]">{description}</p>}
        </div>
    );
};

export default SectionTitle;
