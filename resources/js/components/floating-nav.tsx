import { Link } from '@inertiajs/react';
import { Coins, FileText, Home as HomeIcon, LucideIcon, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    route: string;
    showIcon: boolean;
}

interface FloatingNavProps {
    currentPage?: string;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, route: '/', showIcon: true },
    { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
    { id: 'crypto', label: 'Crypto', icon: Coins, route: '/crypto', showIcon: true },
    { id: 'stocks', label: 'Stocks', icon: TrendingUp, route: '/stocks', showIcon: true },
];

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
            className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ease-in-out ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className="rounded-full border border-white/20 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;

                        return (
                            <Link
                                key={`${item.id}-${index}`}
                                href={item.route}
                                onClick={() => setActiveItem(item.id)}
                                className={`group relative flex items-center space-x-2 rounded-full px-5 py-3 transition-all duration-200 ${
                                    isActive ? 'scale-105 bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                {item.showIcon && <Icon className="h-5 w-5" />}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
