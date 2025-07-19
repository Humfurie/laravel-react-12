import React, { useState } from "react";
import { FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Socials from "./Socials";

interface FooterArr {
    label: string;
    url?: string;
    icon?: React.ReactNode;
}

interface FooterData {
    title: string;
    items: FooterArr[]
}

const footerData: FooterData[] = [
    {
        title: "Navigate",
        items: [
            {
                label: "Home",
                url: "/"
            },
            {
                label: "About Me",
                url: "/about-me"
            },
            {
                label: "Projects",
                url: "/projects"
            },
            {
                label: "Blogs",
                url: "/blogs"
            },
        ]
    },
    {
        title: "Contact Me",
        items: [
            {
                label: "humfurie@gmail.com",
                icon: <MdEmail />
            },
            {
                label: "+63 9397535416",
                icon: <FaPhone />
            },

        ]
    },

]

export default function Footer() {

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2s
    };
    return (
        <footer className="relative w-full">
            <div className="absolute inset-0 w-full h-full bg-brand-black/70 backdrop-blur-[7px] z-10"></div>
            <picture>
                <source srcSet="/images/humphrey-footer.webp" media="(min-width: 768px)" />
                <img
                    src="/images/humphrey-footer.webp"
                    alt="Humphrey Footer"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
            </picture>

            <div className="primary-container relative z-10 py-[40px] md:py-[80px] flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-10 text-black">
                {footerData.map((section, index) => (
                    <div key={index} className="w-full sm:w-[200px] flex flex-col items-center md:items-start text-center md:text-start">
                        <h5 className="font-bold text-[18px] mb-4 text-white">
                            {section.title}
                        </h5>

                        <ul className="space-y-2 w-full">
                            {section.items.map((item, i) => (
                                <li
                                    key={i}
                                    className="relative flex items-center justify-center md:justify-start gap-2 text-white cursor-pointer"
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
                                                <span className="absolute -top-3 right-0 text-xs text-white ml-2 bg-brand-orange rounded-sm px-2">Copied!</span>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))}

                        </ul>

                        {/* Socials under Contact Me */}
                        {section.title === "Contact Me" && (
                            <div className="mt-6">
                                <Socials />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full text-center py-6 bg-white/70 text-brand-black backdrop-blur-md">
                © 2025 Humfurie™. All Rights Reserved.
            </div>
        </footer>
    );
}
