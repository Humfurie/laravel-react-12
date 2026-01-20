import { Link } from '@inertiajs/react';
import { FileText, FolderKanban, Github, Home, Linkedin, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const navLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Blog', href: '/blog', icon: FileText },
];

const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/Humfurie', icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/humphrey-singculan-09a459153', icon: Linkedin },
    { label: 'Facebook', href: 'https://www.facebook.com/humphrey123', icon: FaFacebook },
    { label: 'Instagram', href: 'https://www.instagram.com/humfuree/', icon: FaInstagram },
    { label: 'X', href: 'https://x.com/Humphfries', icon: FaXTwitter },
];

const contactInfo = [
    { label: 'humfurie@gmail.com', icon: Mail },
    { label: '+63 9397535416', icon: Phone },
];

export default function Footer() {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(null), 2000);
    };

    return (
        <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-700/50 dark:bg-gray-950">
            <div className="container mx-auto px-4 py-12">
                {/* Main Content - Centered */}
                <div className="flex flex-col items-center text-center">
                    {/* Logo & Name */}
                    <Link href="/" className="mb-6 flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-10 w-10" />
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Humphrey Singculan</span>
                    </Link>

                    {/* Tagline */}
                    <p className="mb-8 max-w-md text-gray-600 dark:text-gray-300">
                        Software Engineer specializing in Laravel, React, and full-stack development.
                    </p>

                    {/* Navigation Links */}
                    <nav className="mb-8 flex flex-wrap justify-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="flex items-center gap-2 text-gray-600 transition-colors hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
                            >
                                <link.icon className="h-4 w-4" />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Contact Info */}
                    <div className="mb-8 flex flex-wrap justify-center gap-6">
                        {contactInfo.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => handleCopy(item.label)}
                                className="relative flex items-center gap-2 text-gray-600 transition-colors hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400"
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                                {copiedText === item.label && (
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-orange-500 px-2 py-1 text-xs text-white">
                                        Copied!
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Social Links */}
                    <div className="mb-8 flex justify-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="rounded-full bg-gray-200 p-2.5 text-gray-600 transition-all hover:bg-orange-500 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-orange-500 dark:hover:text-white"
                            >
                                <social.icon className="h-5 w-5" />
                            </a>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="mb-6 h-px w-full max-w-md bg-gray-200 dark:bg-gray-700/50" />

                    {/* Copyright & Source */}
                    <div className="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <p>© {new Date().getFullYear()} Humphrey Singculan. All rights reserved.</p>
                        <a
                            href="https://github.com/Humfurie/laravel-react-12"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                            <Github className="h-4 w-4" />
                            <span>View Source Code</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
