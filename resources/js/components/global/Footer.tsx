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
        <footer className="border-t border-white/[0.08] bg-[#1B3D2F] py-10 text-white/45 dark:bg-[#0A1210]">
            <div className="mx-auto max-w-[1200px] px-6">
                {/* Main row: logo — nav — social */}
                <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={(e) => handleNavClick(e, '/')}
                        className="font-display text-xl font-medium text-white transition-colors hover:text-[#F5C89E]"
                    >
                        Humphrey
                    </Link>

                    {/* Nav Links */}
                    <nav className="flex flex-wrap justify-center gap-7">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="text-[0.85rem] text-white/45 transition-colors duration-300 hover:text-[#F5C89E]"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Social + Email */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="text-white/45 transition-colors duration-300 hover:text-[#F5C89E]"
                            >
                                <social.icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-6 text-[0.8rem] md:flex-row">
                    <p>© {new Date().getFullYear()} Humphrey Singculan</p>
                    <button
                        onClick={handleCopyEmail}
                        className="transition-colors duration-300 hover:text-[#F5C89E]"
                    >
                        {copied ? 'Copied!' : 'humfurie@gmail.com'}
                    </button>
                    <a
                        href="https://github.com/Humfurie/laravel-react-12"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-300 hover:text-[#F5C89E]"
                    >
                        View Source
                    </a>
                </div>
            </div>
        </footer>
    );
}
