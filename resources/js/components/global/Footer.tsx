import React, { useState } from 'react';
import { FaPhone } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import Socials from './Socials';

interface FooterArr {
    label: string;
    url?: string;
    icon?: React.ReactNode;
}

interface FooterData {
    title: string;
    items: FooterArr[];
}

const footerData: FooterData[] = [
    {
        title: 'Navigate',
        items: [
            {
                label: 'Home',
                url: '/',
            },
            {
                label: 'About Me',
                url: '/about-me',
            },
            {
                label: 'Projects',
                url: '/projects',
            },
            {
                label: 'Blogs',
                url: '/blogs',
            },
        ],
    },
    {
        title: 'Contact Me',
        items: [
            {
                label: 'humfurie@gmail.com',
                icon: <MdEmail />,
            },
            {
                label: '+63 9397535416',
                icon: <FaPhone />,
            },
        ],
    },
];

export default function Footer() {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2s
    };
    return (
        <footer className="relative w-full">
            <div className="bg-brand-black/70 absolute inset-0 z-10 h-full w-full backdrop-blur-[7px]"></div>
            <picture>
                <source srcSet="/images/humphrey-footer.webp" media="(min-width: 768px)" />
                <img
                    src="/images/humphrey-footer.webp"
                    alt="Humphrey Footer"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
            </picture>

            <div className="primary-container relative z-10 flex flex-col items-center justify-center gap-10 py-[40px] text-black md:flex-row md:items-start md:justify-start md:py-[80px]">
                {footerData.map((section, index) => (
                    <div key={index} className="flex w-full flex-col items-center text-center sm:w-[200px] md:items-start md:text-start">
                        <h5 className="mb-4 text-[18px] font-bold text-white">{section.title}</h5>

                        <ul className="w-full space-y-2">
                            {section.items.map((item, i) => (
                                <li
                                    key={i}
                                    className="relative flex cursor-pointer items-center justify-center gap-2 text-white md:justify-start"
                                    onClick={() => {
                                        if (!item.url && item.label) handleCopy(item.label, i);
                                    }}
                                >
                                    {item.icon && <span className="text-xl">{item.icon}</span>}
                                    {item.url ? (
                                        <a href={item.url} className="hover:underline">
                                            {item.label}
                                        </a>
                                    ) : (
                                        <>
                                            <span className="hover:underline">{item.label}</span>
                                            {copiedIndex === i && (
                                                <span className="bg-brand-orange absolute -top-3 right-0 ml-2 rounded-sm px-2 text-xs text-white">
                                                    Copied!
                                                </span>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Socials under Contact Me */}
                        {section.title === 'Contact Me' && (
                            <div className="mt-6">
                                <Socials />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-brand-black relative z-10 w-full bg-white/70 py-6 text-center backdrop-blur-md">
                © 2025 Humfurie™. All Rights Reserved.
            </div>
        </footer>
    );
}
