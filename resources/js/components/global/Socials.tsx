import Facebook from '@/svgs/Facebook';
import Github from '@/svgs/Github';
import LinkedIn from '@/svgs/LinkedIn';
import React from 'react';

interface SocialsProps {
    className?: string;
}

interface SocialAtt {
    icon: React.ReactNode;
    name: string;
    url: string;
    className: string;
}

const socialsData: SocialAtt[] = [
    {
        icon: <Facebook />,
        name: "Facebook",
        url: "https://www.facebook.com/humphrey123",
        className: "text-blue-600 hover:text-blue-500"
    },
    {
        icon: <LinkedIn />,
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/humphrey-singculan-09a459153/",
        className: "text-blue-700 hover:text-blue-600"
    },
    {
        icon: <Github />,
        name: "GitHub",
        url: "https://github.com/Humfurie",
        className: "text-brand-black hover:text-muted-black"
    }
];

const Socials: React.FC<SocialsProps> = ({ className }) => {
    return (
        <div className={`flex gap-4 sm:gap-[32px] ${className}`}>
            {socialsData.map((social) => (
                <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${social.className} hs-bg-white text-[24px] md:text-[28px] lg:text-[28px] transition-transform transition-colors duration-200 hover:scale-110 hover:shadow-lg
                    `}
                    aria-label={social.name}
                >
                    {social.icon}
                </a>
            ))}
        </div>
    );
};

export default Socials;
