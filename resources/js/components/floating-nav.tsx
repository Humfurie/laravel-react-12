import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { publicNavItems } from '@/config/navigation';

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
            className={`fixed left-1/2 z-50 w-[calc(100vw-16px)] max-w-[95vw] -translate-x-1/2 transform transition-all duration-300 ease-in-out sm:w-auto sm:max-w-none ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            } top-2 sm:top-4 lg:top-6`}
        >
            <div className="rounded-full border border-white/20 bg-white/80 px-2 py-2 shadow-lg backdrop-blur-md sm:px-4 lg:px-6 lg:py-4">
                <div className="flex items-center justify-center gap-1 sm:gap-2 lg:gap-3">
                    {publicNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;

                        return (
                            <Link
                                key={`${item.id}-${index}`}
                                href={item.route}
                                onClick={() => setActiveItem(item.id)}
                                className={`group relative flex shrink-0 items-center justify-center rounded-full p-2 transition-all duration-200 sm:p-2.5 lg:flex-row lg:space-x-2 lg:px-5 lg:py-3 ${
                                    isActive ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5" />
                                <span className="hidden font-medium lg:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
