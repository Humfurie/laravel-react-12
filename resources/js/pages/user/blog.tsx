import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Footer from '@/components/global/Footer';
import { router } from '@inertiajs/react';
import { Eye, Calendar, Star } from 'lucide-react';

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
    const tabs = [
        { id: 'home', label: 'Home', icon: '🏠', route: '/' },
        { id: 'contact', label: 'Contact', icon: '📧', route: '/contact' },
        { id: 'blog', label: 'Blog', icon: '📝', route: '/blog', active: true }
    ];

    return (
        <>
            <Head title="Blog" />

            <div className="min-h-screen bg-muted-white">
                {/* Navigation Tabs */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-brand-orange/10">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex items-center space-x-8">
                                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                    <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-brand-gold rounded-2xl flex items-center justify-center text-white font-bold shadow-xl">
                                        HS
                                    </div>
                                    <span className="font-bold text-2xl text-brand-black">Humfurie</span>
                                </Link>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex space-x-1">
                                {tabs.map((tab) => (
                                    <Link
                                        key={tab.id}
                                        href={tab.route}
                                        className={`
                                            px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                                            hover:bg-brand-orange/10 hover:text-brand-orange hover:shadow-lg transform hover:scale-105
                                            ${tab.active
                                                ? 'bg-gradient-to-r from-brand-orange to-brand-gold text-white shadow-xl'
                                                : 'text-brand-black/70 bg-white/50 hover:bg-white'
                                            }
                                        `}
                                    >
                                        <span className="mr-2">{tab.icon}</span>
                                        {tab.label}
                                    </Link>
                                ))}
                            </div>
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
                                        <EnhancedBlogCard key={blog.id} blog={blog} showStats={true} />
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
