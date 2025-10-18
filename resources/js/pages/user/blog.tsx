import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Eye, FileText, Home as HomeIcon, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published' | 'private';
    featured_image: string | null;
    display_image: string | null;
    meta_data: {
        meta_title?: string;
        meta_description?: string;
        meta_keywords?: string;
    } | null;
    isPrimary: boolean;
    sort_order: number;
    view_count: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    status_label: string;
}

interface Props {
    blogs: {
        data: Blog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'published':
            return 'bg-green-100 text-green-800';
        case 'draft':
            return 'bg-yellow-100 text-yellow-800';
        case 'private':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Enhanced BlogCard with view counts and better design
function EnhancedBlogCard({ blog, size = 'normal', showStats = true }: { blog: Blog; size?: 'normal' | 'large' | 'small'; showStats?: boolean }) {
    const viewCount = blog.view_count || 0;

    const handleCardClick = () => {
        router.visit(`/blog/${blog.slug}`);
    };

    const cardClasses = {
        normal: 'h-full',
        large: 'h-full lg:col-span-2',
        small: 'h-full',
    };

    return (
        <Card
            className={`${cardClasses[size]} group hover:shadow-brand-orange/20 cursor-pointer rounded-2xl border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
            onClick={handleCardClick}
        >
            {blog.display_image && (
                <div className={`${size === 'large' ? 'aspect-[2/1]' : 'aspect-video'} relative overflow-hidden rounded-t-2xl`}>
                    <img
                        src={blog.display_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {blog.isPrimary && (
                        <div className="absolute top-4 left-4">
                            <Badge className="from-brand-orange to-brand-gold rounded-full bg-gradient-to-r px-4 py-2 text-white shadow-xl">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                            </Badge>
                        </div>
                    )}
                    {showStats && (
                        <div className="from-brand-orange/90 to-brand-gold/90 absolute right-4 bottom-4 flex items-center gap-1 rounded-xl bg-gradient-to-r px-3 py-2 text-xs text-white shadow-lg">
                            <Eye className="h-3 w-3" />
                            {viewCount}
                        </div>
                    )}
                </div>
            )}
            <CardContent className={`${size === 'large' ? 'p-8' : 'p-6'}`}>
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getStatusColor(blog.status)} variant="secondary">
                            {blog.status_label}
                        </Badge>
                        {blog.isPrimary && !blog.display_image && (
                            <Badge className="from-brand-orange to-brand-gold rounded-full bg-gradient-to-r px-4 py-1 text-white shadow-lg">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                            </Badge>
                        )}
                    </div>

                    <h2
                        className={`${size === 'large' ? 'text-2xl' : 'text-xl'} group-hover:text-brand-orange text-brand-black line-clamp-2 leading-tight font-bold transition-colors`}
                    >
                        {blog.title}
                    </h2>

                    {blog.excerpt && (
                        <p className="line-clamp-3 leading-relaxed text-gray-600">{truncateText(blog.excerpt, size === 'large' ? 200 : 120)}</p>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                            {blog.published_at && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                                </span>
                            )}
                            {showStats && (
                                <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {viewCount}
                                </span>
                            )}
                        </div>
                        <span className="text-brand-orange hover:text-brand-gold flex items-center gap-1 font-semibold transition-all group-hover:gap-2">
                            Read more
                            <span className="transform transition-transform group-hover:translate-x-1">→</span>
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function BlogIndex({ blogs }: Props) {
    const [isVisible, setIsVisible] = useState(true);
    const [activeItem, setActiveItem] = useState('blog');

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const updateScrollDirection = () => {
            const scrollY = window.scrollY;
            const direction = scrollY > lastScrollY ? 'down' : 'up';
            if (direction !== (isVisible ? 'up' : 'down')) {
                setIsVisible(direction === 'up' || scrollY < 50);
            }
            lastScrollY = scrollY > 0 ? scrollY : 0;
        };

        window.addEventListener('scroll', updateScrollDirection);
        return () => window.removeEventListener('scroll', updateScrollDirection);
    }, [isVisible]);

    const navItems = [
        { id: 'home', label: 'Home', icon: HomeIcon, route: '/', showIcon: true },
        { id: 'blog', label: 'Blog', icon: FileText, route: '/blog', showIcon: true },
    ];

    return (
        <>
            <Head title="Blog">
                <meta
                    name="description"
                    content="Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development."
                />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content="Blog - All Posts" />
                <meta
                    property="og:description"
                    content="Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="/images/og-default.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Blog - Technology Articles and Insights" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Blog - All Posts" />
                <meta
                    name="twitter:description"
                    content="Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development."
                />
                <meta name="twitter:image" content="/images/og-default.jpg" />
            </Head>

            <div className="bg-muted-white min-h-screen">
                {/* Floating Navbar */}
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
                                            isActive
                                                ? 'scale-105 bg-orange-500 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                        title={item.label}
                                    >
                                        {/* Desktop: Show both icon and text */}
                                        <Icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
                                        <span className="hidden text-sm font-medium sm:block">{item.label}</span>

                                        {/* Mobile tooltip - only for icon-only buttons */}
                                        <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:hidden">
                                            <div className="rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">{item.label}</div>
                                            <div className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1 transform border-r-2 border-b-2 border-l-2 border-transparent border-b-gray-900"></div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                {/* Header Section */}
                <section className="from-brand-orange via-brand-gold to-brand-orange relative overflow-hidden bg-gradient-to-br py-16 text-white">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                    <div className="relative z-10">
                        <div className="container mx-auto px-4">
                            <div className="space-y-4 text-center">
                                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">All Blog Posts</h1>
                                <p className="mx-auto max-w-xl text-lg text-orange-100">Browse through all our articles, tutorials, and insights</p>
                                <div className="text-sm text-orange-200">
                                    {blogs.total} post{blogs.total !== 1 ? 's' : ''} found
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Posts List */}
                <section className="bg-white py-16">
                    <div className="container mx-auto px-4">
                        {blogs.data.length === 0 ? (
                            <div className="py-12 text-center">
                                <h3 className="text-brand-black mb-4 text-2xl font-semibold">No posts found</h3>
                                <p className="text-gray-600">We're working on some great content. Check back soon!</p>
                                <div className="mt-6">
                                    <Button
                                        onClick={() => router.visit('/')}
                                        className="from-brand-orange to-brand-gold rounded-xl bg-gradient-to-r px-6 py-3 text-white"
                                    >
                                        Back to Home
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {blogs.data.map((blog) => (
                                        <EnhancedBlogCard key={String(blog.id)} blog={blog} showStats={true} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {blogs.last_page > 1 && (
                                    <div className="mt-16 flex justify-center">
                                        <div className="flex gap-2">
                                            {Array.from({ length: blogs.last_page }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => router.visit(`/blog?page=${page}`)}
                                                    className={`transform rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:scale-105 ${
                                                        page === blogs.current_page
                                                            ? 'from-brand-orange to-brand-gold bg-gradient-to-r text-white shadow-xl'
                                                            : 'hover:bg-brand-orange/10 hover:text-brand-orange border border-gray-200 bg-white text-gray-600 shadow-md hover:shadow-lg'
                                                    } `}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Back to Home CTA */}
                <section className="bg-gray-50 py-12">
                    <div className="container mx-auto px-4 text-center">
                        <p className="mb-4 text-gray-600">Looking for featured content and highlights?</p>
                        <Button
                            onClick={() => router.visit('/')}
                            className="from-brand-orange to-brand-gold hover:from-brand-orange/90 hover:to-brand-gold/90 transform rounded-2xl bg-gradient-to-r px-8 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        >
                            ← Back to Home
                        </Button>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
