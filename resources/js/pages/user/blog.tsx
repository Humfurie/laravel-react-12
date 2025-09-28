import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Footer from '@/components/global/Footer';
import { router } from '@inertiajs/react';
import { Eye, Calendar, Star, Home as HomeIcon, FileText, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';

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
function EnhancedBlogCard({ blog, size = 'normal', showStats = true }: {
    blog: Blog;
    size?: 'normal' | 'large' | 'small';
    showStats?: boolean;
}) {
    const viewCount = blog.view_count || 0;

    const handleCardClick = () => {
        router.visit(`/blog/${blog.slug}`);
    };

    const cardClasses = {
        normal: "h-full",
        large: "h-full lg:col-span-2",
        small: "h-full"
    };

    return (
        <Card
            className={`${cardClasses[size]} hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border-0 shadow-lg bg-white rounded-2xl hover:shadow-brand-orange/20`}
            onClick={handleCardClick}
        >
            {blog.display_image && (
                <div className={`${size === 'large' ? 'aspect-[2/1]' : 'aspect-video'} overflow-hidden rounded-t-2xl relative`}>
                    <img
                        src={blog.display_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {blog.isPrimary && (
                        <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-full px-4 py-2 shadow-xl">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                            </Badge>
                        </div>
                    )}
                    {showStats && (
                        <div className="absolute bottom-4 right-4 bg-gradient-to-r from-brand-orange/90 to-brand-gold/90 text-white px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-lg">
                            <Eye className="w-3 h-3" />
                            {viewCount}
                        </div>
                    )}
                </div>
            )}
            <CardContent className={`${size === 'large' ? 'p-8' : 'p-6'}`}>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(blog.status)} variant="secondary">{blog.status_label}</Badge>
                        {blog.isPrimary && !blog.display_image && (
                            <Badge className="bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-full px-4 py-1 shadow-lg">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                            </Badge>
                        )}
                    </div>

                    <h2 className={`${size === 'large' ? 'text-2xl' : 'text-xl'} font-bold line-clamp-2 group-hover:text-brand-orange transition-colors text-brand-black leading-tight`}>
                        {blog.title}
                    </h2>

                    {blog.excerpt && (
                        <p className="text-gray-600 line-clamp-3 leading-relaxed">
                            {truncateText(blog.excerpt, size === 'large' ? 200 : 120)}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            {blog.published_at && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                                </span>
                            )}
                            {showStats && (
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {viewCount}
                                </span>
                            )}
                        </div>
                        <span className="text-brand-orange hover:text-brand-gold font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read more
                            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
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
            <Head title="Blog">
                <meta name="description" content="Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development." />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content="Blog - All Posts" />
                <meta property="og:description" content="Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="/images/og-default.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Blog - Technology Articles and Insights" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Blog - All Posts" />
                <meta name="twitter:description" content="Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development." />
                <meta name="twitter:image" content="/images/og-default.jpg" />
            </Head>

            <div className="min-h-screen bg-muted-white">
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

                {/* Header Section */}
                <section className="bg-gradient-to-br from-brand-orange via-brand-gold to-brand-orange py-16 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                    <div className="relative z-10">
                        <div className="container mx-auto px-4">
                            <div className="text-center space-y-4">
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                    All Blog Posts
                                </h1>
                                <p className="text-lg text-orange-100 max-w-xl mx-auto">
                                    Browse through all our articles, tutorials, and insights
                                </p>
                                <div className="text-sm text-orange-200">
                                    {blogs.total} post{blogs.total !== 1 ? 's' : ''} found
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Posts List */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        {blogs.data.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-2xl font-semibold mb-4 text-brand-black">No posts found</h3>
                                <p className="text-gray-600">
                                    We're working on some great content. Check back soon!
                                </p>
                                <div className="mt-6">
                                    <Button
                                        onClick={() => router.visit('/')}
                                        className="bg-gradient-to-r from-brand-orange to-brand-gold text-white px-6 py-3 rounded-xl"
                                    >
                                        Back to Home
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                                    className={`
                                                        px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
                                                        ${page === blogs.current_page
                                                            ? 'bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow-xl'
                                                            : 'bg-white text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange shadow-md hover:shadow-lg border border-gray-200'
                                                        }
                                                    `}
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
                <section className="py-12 bg-gray-50">
                    <div className="container mx-auto px-4 text-center">
                        <p className="text-gray-600 mb-4">Looking for featured content and highlights?</p>
                        <Button
                            onClick={() => router.visit('/')}
                            className="bg-gradient-to-r from-brand-orange to-brand-gold hover:from-brand-orange/90 hover:to-brand-gold/90 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
