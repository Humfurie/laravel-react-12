import { publicNavItems } from '@/config/navigation';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogIn, LayoutDashboard, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ThemeToggle from './theme-toggle';

interface FloatingNavProps {
    currentPage?: string;
}

export default function FloatingNav({ currentPage = 'home' }: FloatingNavProps) {
    const [activeItem, setActiveItem] = useState(currentPage);
    const { url, props } = usePage<SharedData>();
    const isLoggedIn = !!props.auth.user;
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isCurrentPage = (href: string) => {
        const currentPath = url.split('?')[0];
        return currentPath === href || (currentPath === '/' && href === '/');
    };

    // Navbar scroll behavior
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsScrolled(currentScrollY > 40);

            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
                setIsMobileMenuOpen(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <nav
            className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            } ${isScrolled ? 'bg-white/90 shadow-sm backdrop-blur-md dark:bg-[#0F1A15]/90' : 'bg-transparent'}`}
        >
            <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
                {/* Logo — Cormorant Garamond */}
                <Link
                    href="/"
                    onClick={(e) => {
                        if (isCurrentPage('/')) {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }}
                    className="font-display text-2xl font-medium tracking-tight text-[#1A1A1A] transition-colors hover:text-[#1B3D2F] dark:text-white dark:hover:text-[#5AAF7E]"
                >
                    Humphrey
                </Link>

                {/* Desktop Nav Links */}
                <ul className="hidden items-center gap-9 md:flex">
                    {publicNavItems.map((item) => {
                        const isActive = isCurrentPage(item.route);
                        return (
                            <li key={item.id} className="group">
                                <Link
                                    href={item.route}
                                    onClick={(e) => {
                                        if (isCurrentPage(item.route)) {
                                            e.preventDefault();
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            return;
                                        }
                                        setActiveItem(item.id);
                                    }}
                                    className={`relative text-[0.85rem] font-normal tracking-wide transition-colors duration-300 ${
                                        isActive
                                            ? 'text-[#1A1A1A] dark:text-white'
                                            : 'text-[#6B6B63] hover:text-[#1A1A1A] dark:text-[#9E9E95] dark:hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                    {/* Underline on hover — orange accent */}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-px bg-[#E8945A] transition-all duration-300 ${
                                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}
                                    />
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Right side: Theme toggle + Auth + CTA */}
                <div className="hidden items-center gap-4 md:flex">
                    <ThemeToggle />
                    <Link
                        href={isLoggedIn ? '/dashboard' : '/login'}
                        className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-[#6B6B63] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9E95] dark:hover:text-white"
                    >
                        {isLoggedIn ? (
                            <>
                                <LayoutDashboard className="h-3.5 w-3.5" />
                                Dashboard
                            </>
                        ) : (
                            <>
                                <LogIn className="h-3.5 w-3.5" />
                                Login
                            </>
                        )}
                    </Link>
                    <Link
                        href="/guestbook"
                        className="rounded-full bg-[#1B3D2F] px-6 py-2.5 text-[0.82rem] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#2A5E44] dark:bg-[#5AAF7E] dark:text-[#0F1A15] dark:hover:bg-[#4A9F6E]"
                    >
                        Get in touch
                    </Link>
                </div>

                {/* Mobile: theme toggle + hamburger */}
                <div className="flex items-center gap-3 md:hidden">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-[#1A1A1A] dark:text-white"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="border-t border-[#E5E4E0] bg-white/95 px-6 py-4 backdrop-blur-md md:hidden dark:border-[#2A4A3A] dark:bg-[#0F1A15]/95">
                    <ul className="flex flex-col gap-1">
                        {publicNavItems.map((item) => {
                            const isActive = isCurrentPage(item.route);
                            return (
                                <li key={item.id}>
                                    <Link
                                        href={item.route}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                                            isActive
                                                ? 'bg-[#E4EDE8] font-medium text-[#1B3D2F] dark:bg-[#1E3A2D] dark:text-[#5AAF7E]'
                                                : 'text-[#6B6B63] hover:bg-[#F3F1EC] dark:text-[#9E9E95] dark:hover:bg-[#1E3A2D]'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                        <li className="mt-2 border-t border-[#E5E4E0] pt-3 dark:border-[#2A4A3A]">
                            <Link
                                href={isLoggedIn ? '/dashboard' : '/login'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-[#6B6B63] transition-colors hover:bg-[#F3F1EC] dark:text-[#9E9E95] dark:hover:bg-[#1E3A2D]"
                            >
                                {isLoggedIn ? (
                                    <>
                                        <LayoutDashboard className="h-4 w-4" />
                                        Dashboard
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4" />
                                        Login
                                    </>
                                )}
                            </Link>
                        </li>
                        <li className="mt-1">
                            <Link
                                href="/guestbook"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block rounded-full bg-[#1B3D2F] px-6 py-2.5 text-center text-sm font-medium text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]"
                            >
                                Get in touch
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </nav>
    );
}
