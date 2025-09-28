import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

import { JSX, useEffect, useState } from 'react';
import { ExperienceSection } from '@/components/home/sections/ExperienceSection';
import { FileText, Home as HomeIcon } from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'private';
    featured_image: string | null;
    meta_data: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string;
    } | null;
    isPrimary: boolean;
    sort_order: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    status_label: string;
}

interface Props {
    primary: Blog[];
    latest: Blog[];
}

const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

function BlogCard({ blog }: { blog: Blog }) {
    const handleCardClick = () => {
        router.visit(`/blog/${blog.slug}`);
    };

    return (
        <Card
            className="h-full hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            {blog.featured_image && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {blog.isPrimary && (
                            <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                    </div>

                    <h3 className="font-semibold line-clamp-2 text-sm">{blog.title}</h3>

                    {blog.excerpt && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                            {truncateText(blog.excerpt, 80)}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        {blog.published_at && (
                            <span>
                                {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                            </span>
                        )}
                        <span className="text-primary hover:underline">
                            Read →
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Home({ primary = [], latest = [] }: Props): JSX.Element {
    const [isVisible, setIsVisible] = useState(true);
    const [activeItem, setActiveItem] = useState('home');

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const updateScrollDirection = () => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY ? "down" : "up";
            if (direction !== (isVisible ? "up" : "down")) {
                setIsVisible(direction === "up" || scrollY < 50);
            }
            lastScrollY = scrollY > 0 ? scrollY : 0;
        };

        window.addEventListener("scroll", updateScrollDirection);
        return () => window.removeEventListener("scroll", updateScrollDirection);
    }, [isVisible]);

    const navItems = [
        { id: 'home', label: 'Home', icon: HomeIcon, route: '/', showIcon: true },
        { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
    ];

    return (
        <>
            <Head title="Contact" />

            {/* Navigation Tabs */}
            {/* Floating Navbar */}
            <nav
                className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
                    isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
            >
                <div className="bg-white/80 backdrop-blur-md rounded-full px-6 py-4 shadow-lg border border-white/20">
                    <div className="flex items-center space-x-3">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;

                            return (
                                <Link
                                    key={`${item.id}-${index}`}
                                    href={item.route}
                                    onClick={() => setActiveItem(item.id)}
                                    className={`group relative px-5 py-3 rounded-full transition-all duration-200 flex items-center space-x-2 ${
                                        isActive
                                            ? 'bg-orange-500 text-white shadow-md scale-105'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    title={item.label}
                                >
                                    {/* Desktop: Show both icon and text */}
                                    <Icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
                                    <span className="font-medium text-sm hidden sm:block">{item.label}</span>

                                    {/* Mobile tooltip - only for icon-only buttons */}
                                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:hidden">
                                        <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                                            {item.label}
                                        </div>
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-900"></div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <HomeBanner />
            <HomeAboutMe />
            {/*<HomeProjects />*/}
            <HomeExpertise />
            <ExperienceSection />
            {/*<HomeCTA />*/}

            {/* Blog Section */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">From Our Blog</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Discover insights, tutorials, and stories. Stay updated with the latest trends and best practices.
                        </p>
                    </div>

                    {/* Primary/Featured Posts */}
                    {primary.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-xl font-semibold mb-6 text-center">Featured Posts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {primary.map((blog) => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Latest Posts */}
                    {latest.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-6 text-center">Latest Posts</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {latest.slice(0, 6).map((blog) => (
                                    <BlogCard key={blog.id} blog={blog} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* View All Button */}
                    <div className="text-center">
                        <button
                            onClick={() => router.visit('/blog')}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-xl hover:from-brand-orange/90 hover:to-brand-gold/90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            View All Posts
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
