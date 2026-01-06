import { publicNavItems } from '@/config/navigation';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ThemeToggle from './theme-toggle';

interface FloatingNavProps {
    currentPage?: string;
}

export default function FloatingNav({ currentPage = 'home' }: FloatingNavProps) {
    const [activeItem, setActiveItem] = useState(currentPage);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Navbar scroll behavior - hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY || currentScrollY < 100) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
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
            }`}
        >
            <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4">
                <div className="flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
                    {/* Logo with Humfurie - stands out */}
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-xl dark:bg-gray-900/90 dark:hover:bg-gray-900"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="size-8 object-contain" />
                        </div>
                        <span className="pr-1 text-sm font-bold text-gray-900 dark:text-white">Humfurie</span>
                    </Link>

                    {/* Desktop Pill Navigation */}
                    <div className="hidden items-center gap-1 rounded-full border border-gray-200/50 bg-white/60 px-2 py-1.5 backdrop-blur-sm transition-all duration-300 md:flex dark:border-gray-600/50 dark:bg-gray-800/60">
                        {publicNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.route}
                                    onClick={() => setActiveItem(item.id)}
                                    className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-white/80 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-gray-700/80 dark:hover:text-orange-400'
                                    }`}
                                >
                                    {item.showIcon && (
                                        <Icon
                                            className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? '' : 'group-hover:rotate-6'}`}
                                        />
                                    )}
                                    <span className="transition-all duration-200">{item.label}</span>
                                </Link>
                            );
                        })}
                        <div className="ml-1 border-l border-gray-200/50 pl-1 dark:border-gray-600/50">
                            <ThemeToggle variant="with-label" />
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex items-center gap-0.5 md:hidden">
                        {publicNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.route}
                                    onClick={() => setActiveItem(item.id)}
                                    className={`rounded-full p-1.5 transition-all duration-200 active:scale-95 ${
                                        isActive
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-white/80 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-gray-700/80 dark:hover:text-orange-400'
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? '' : 'hover:scale-110'}`} />
                                </Link>
                            );
                        })}
                        <div className="ml-0.5">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
