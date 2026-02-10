import { Link, usePage } from '@inertiajs/react';
import { Github, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: '/resume' },
    { label: 'Guestbook', href: '/guestbook' },
];

const socialLinks = [
    { label: 'GitHub', href: 'https://github.com/Humfurie', icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/humphrey-singculan-09a459153', icon: Linkedin },
    { label: 'Facebook', href: 'https://www.facebook.com/humphrey123', icon: FaFacebook },
    { label: 'Instagram', href: 'https://www.instagram.com/humfuree/', icon: FaInstagram },
    { label: 'X', href: 'https://x.com/Humphfries', icon: FaXTwitter },
];

export default function Footer() {
    const { url } = usePage();
    const [copied, setCopied] = useState(false);

    const isCurrentPage = (href: string) => {
        // Normalize URLs for comparison
        const currentPath = url.split('?')[0];
        return currentPath === href || (currentPath === '/' && href === '/');
    };

    const handleNavClick = (e: React.MouseEvent, href: string) => {
        if (isCurrentPage(href)) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('humfurie@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <footer className="border-t border-gray-100 bg-white dark:border-gray-800/50 dark:bg-gray-950">
            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Left - Brand */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            onClick={(e) => handleNavClick(e, '/')}
                            className="text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Humphrey Singculan
                        </Link>
                        <span className="hidden text-gray-300 dark:text-gray-700 md:inline">|</span>
                        <nav className="hidden items-center gap-6 md:flex">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right - Social & Email */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="text-gray-400 transition-colors hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                            >
                                <social.icon className="h-4 w-4" />
                            </a>
                        ))}
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                            onClick={handleCopyEmail}
                            className="relative text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            {copied ? 'Copied!' : 'humfurie@gmail.com'}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                <nav className="mt-6 flex justify-center gap-6 md:hidden">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Bottom */}
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-400 md:flex-row dark:border-gray-800/50 dark:text-gray-500">
                    <p>© {new Date().getFullYear()} Humphrey Singculan</p>
                    <a
                        href="https://github.com/Humfurie/laravel-react-12"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-gray-900 dark:hover:text-white"
                    >
                        View Source
                    </a>
                </div>
            </div>
        </footer>
    );
}
