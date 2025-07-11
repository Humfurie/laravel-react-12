import React from 'react';
import { FaFacebookSquare, FaGithubSquare, FaLinkedin } from 'react-icons/fa';

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
        icon: <FaFacebookSquare />,
        name: "Facebook",
        url: "https://www.linkedin.com/in/humphrey-singculan-09a459153/",
        className: "text-blue-600 hover:text-blue-500"
    },
    {
        icon: <FaLinkedin />,
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/humphrey-singculan-09a459153/",
        className: "text-blue-700 hover:text-blue-600"
    },
    {
        icon: <FaGithubSquare />,
        name: "GitHub",
        url: "https://www.linkedin.com/in/humphrey-singculan-09a459153/",
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
                    className={`${social.className} 
                        hs-bg-white
                        text-[24px] md:text-[28px]
                        transition-transform transition-colors duration-200
                        hover:scale-110
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
