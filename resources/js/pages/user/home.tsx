import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Footer from '@/components/global/Footer';
import { router } from '@inertiajs/react';
import { Eye, Calendar, TrendingUp, Star } from 'lucide-react';

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
    primary: Blog[];
    latest: Blog[];
    stats: {
        total_posts: number;
        total_views: number;
        featured_count: number;
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

export default function Home({ primary = [], latest = [], stats }: Props) {
    const trendingBlogs = [...latest].sort(() => Math.random() - 0.5).slice(0, 3);

    const tabs = [
        { id: 'home', label: 'Home', icon: '🏠', route: '/', active: true },
        { id: 'contact', label: 'Contact', icon: '📧', route: '/contact' },
        { id: 'blog', label: 'Blog', icon: '📝', route: '/blog' }
    ];

    return (
        <>
            <Head title="Home" />

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

                {/* Hero Banner */}
                <section className="bg-gradient-to-br from-brand-orange via-brand-gold to-brand-orange py-24 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                    <div className="relative z-10">
                        <div className="container mx-auto px-4">
                            <div className="text-center space-y-6">
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                    Welcome to <span className="text-yellow-200">Humfurie</span>
                                </h1>
                                <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed">
                                    Discover our latest insights, featured content, and trending articles.
                                    Stay updated with cutting-edge technology and best practices.
                                </p>
                                <div className="flex justify-center space-x-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{stats?.total_posts || 0} Total Posts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        <span>{stats?.featured_count || 0} Featured</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>{stats?.total_views?.toLocaleString() || 0} Views</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured/Primary Posts Banner */}
                {primary.length > 0 && (
                    <section className="py-16 bg-white">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-brand-black mb-4">
                                    ⭐ Featured Posts
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    Our handpicked selection of must-read articles
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {primary.map((blog, index) => (
                                    <EnhancedBlogCard
                                        key={blog.id}
                                        blog={blog}
                                        size={index === 0 ? 'large' : 'normal'}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Trending This Month */}
                {latest.length > 0 && (
                    <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="container mx-auto px-4">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-brand-black mb-4">
                                    🔥 Trending This Month
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    Most viewed articles with highest engagement
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {trendingBlogs.map((blog, index) => (
                                    <div key={blog.id} className="relative">
                                        {index === 0 && (
                                            <div className="absolute -top-2 -right-2 z-10">
                                                <Badge className="bg-red-500 text-white animate-pulse rounded-full px-3 py-1">
                                                    🏆 #1 Trending
                                                </Badge>
                                            </div>
                                        )}
                                        <EnhancedBlogCard blog={blog} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Latest Posts Preview */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-brand-black mb-4">
                                📰 Latest Posts
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Fresh content and recent updates
                            </p>
                        </div>

                        {latest.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-2xl font-semibold mb-4 text-brand-black">No posts found</h3>
                                <p className="text-gray-600">
                                    We're working on some great content. Check back soon!
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {latest.slice(0, 6).map((blog) => (
                                        <EnhancedBlogCard key={blog.id} blog={blog} />
                                    ))}
                                </div>

                                {/* View All Button */}
                                <div className="text-center mt-12">
                                    <Button
                                        onClick={() => router.visit('/blog')}
                                        className="bg-gradient-to-r from-brand-orange to-brand-gold hover:from-brand-orange/90 hover:to-brand-gold/90 text-white px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        View All Blog Posts
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Newsletter Signup */}
                <section className="py-16 bg-gradient-to-r from-brand-orange to-brand-gold text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-orange-100 mb-8 text-lg">
                            Get the latest posts delivered directly to your inbox
                        </p>
                        <div className="max-w-md mx-auto flex gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-white focus:outline-none shadow-lg"
                            />
                            <Button className="bg-white text-brand-orange hover:bg-gray-100 px-6 py-3 rounded-xl shadow-lg">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
