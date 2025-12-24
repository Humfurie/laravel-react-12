import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ArrowUpRight, BookOpen, Calendar, Eye, Sparkles } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

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

const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Magazine-style Blog Card
const BlogCard = memo(function BlogCard({ blog, size = 'normal' }: { blog: Blog; size?: 'normal' | 'large' | 'featured' }) {
    const viewCount = blog.view_count || 0;

    const handleCardClick = useCallback(() => {
        router.visit(`/blog/${blog.slug}`);
    }, [blog.slug]);

    const isLarge = size === 'large';
    const isFeatured = size === 'featured';

    if (isFeatured) {
        return (
            <article className="group cursor-pointer lg:col-span-2" onClick={handleCardClick}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#E8E4DC] dark:bg-gray-800">
                    {blog.display_image ? (
                        <img
                            src={blog.display_image}
                            alt={blog.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-24 w-24 text-gray-400" />
                        </div>
                    )}

                    {/* Date Badge */}
                    {blog.published_at && (
                        <div className="absolute top-6 left-6 rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200">
                            {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}

                    {/* Featured Badge */}
                    {blog.isPrimary && (
                        <div className="absolute top-6 right-6">
                            <Badge className="rounded-full border-0 bg-[#88C0A8] px-4 py-1.5 text-white">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Featured
                            </Badge>
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                        <h2 className="mb-2 line-clamp-2 text-2xl font-bold text-white md:text-3xl">{blog.title}</h2>
                        {blog.excerpt && (
                            <p className="line-clamp-2 max-w-xl text-sm text-white/80 md:text-base">{truncateText(blog.excerpt, 150)}</p>
                        )}
                    </div>

                    {/* View Count */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-1 text-xs text-white/70">
                        <Eye className="h-3 w-3" />
                        {viewCount} views
                    </div>

                    {/* Arrow Link */}
                    <div className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110">
                        <ArrowUpRight className="h-5 w-5 text-gray-900" />
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className={`group cursor-pointer ${isLarge ? 'md:col-span-2' : ''}`} onClick={handleCardClick}>
            {/* Image Container */}
            <div className={`relative overflow-hidden rounded-2xl bg-[#F5F5F3] dark:bg-gray-800 ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
                {blog.display_image ? (
                    <img
                        src={blog.display_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                        <span className="font-serif text-6xl font-bold text-gray-300">{blog.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Featured badge */}
                {blog.isPrimary && (
                    <Badge className="absolute top-4 left-4 rounded-full border-0 bg-[#88C0A8] px-3 py-1 text-white">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Featured
                    </Badge>
                )}

                {/* Date badge */}
                {blog.published_at && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur-sm dark:bg-gray-700/90 dark:text-gray-200">
                        {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                )}

                {/* View count badge */}
                <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    <Eye className="h-3 w-3" />
                    {viewCount}
                </div>

                {/* Arrow Link - appears on hover */}
                <div className="absolute top-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4 text-gray-900" />
                </div>
            </div>

            {/* Content */}
            <div className={`mt-4 ${isLarge ? 'md:mt-6' : ''}`}>
                {/* Title */}
                <h3
                    className={`line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300 ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg'}`}
                >
                    {blog.title}
                </h3>

                {/* Excerpt */}
                {blog.excerpt && (
                    <p className={`mt-2 line-clamp-2 text-gray-500 dark:text-gray-400 ${isLarge ? 'text-base' : 'text-sm'}`}>
                        {truncateText(blog.excerpt, isLarge ? 200 : 100)}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                    {blog.published_at && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {viewCount} views
                    </span>
                </div>
            </div>
        </article>
    );
});

export default function BlogIndex({ blogs }: Props) {
    const [isVisible, setIsVisible] = useState(true);

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

    // Get featured post and rest
    const featuredPost = blogs.data.find((blog) => blog.isPrimary) || blogs.data[0];
    const otherPosts = blogs.data.filter((blog) => blog.id !== featuredPost?.id);

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

                {/* Schema.org JSON-LD Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: 'Blog - All Posts',
                        description:
                            'Browse through all our articles, tutorials, and insights. Discover the latest trends and best practices in technology and development.',
                        url: typeof window !== 'undefined' ? window.location.href : '',
                        mainEntity: {
                            '@type': 'ItemList',
                            itemListElement: blogs.data.map((blog, index) => ({
                                '@type': 'ListItem',
                                position: index + 1,
                                item: {
                                    '@type': 'BlogPosting',
                                    '@id': typeof window !== 'undefined' ? `${window.location.origin}/blog/${blog.slug}` : '',
                                    headline: blog.title,
                                    description: blog.excerpt || '',
                                    image: blog.display_image || '',
                                    datePublished: blog.published_at || blog.created_at,
                                    dateModified: blog.updated_at,
                                    author: {
                                        '@type': 'Person',
                                        name: 'Admin',
                                    },
                                },
                            })),
                        },
                        breadcrumb: {
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                {
                                    '@type': 'ListItem',
                                    position: 1,
                                    name: 'Home',
                                    item: typeof window !== 'undefined' ? window.location.origin : '',
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 2,
                                    name: 'Blog',
                                    item: typeof window !== 'undefined' ? window.location.href : '',
                                },
                            ],
                        },
                    })}
                </script>

                {/* Canonical URL */}
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''} />
            </Head>

            <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900">
                <FloatingNav currentPage="blog" />

                <main className="pt-20">
                    {/* Magazine Hero Section */}
                    <section className="container mx-auto px-4 py-8 md:py-12">
                        {/* Section Header */}
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white">
                                    Best of the
                                    <br />
                                    <span className="relative">
                                        week
                                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                            <path
                                                d="M1 5.5C47.5 2 154.5 1 199 5.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                className="text-gray-300 dark:text-gray-600"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                            <Link
                                href="#all-posts"
                                className="hidden items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 md:flex dark:text-gray-400 dark:hover:text-white"
                            >
                                See all posts
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Featured Grid - Magazine Layout */}
                        {featuredPost && (
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Main Featured Card */}
                                <BlogCard blog={featuredPost} size="featured" />

                                {/* Sidebar Cards */}
                                <div className="flex flex-col gap-6">
                                    {/* Info Card */}
                                    <div className="flex flex-col justify-between rounded-3xl bg-[#C5E8D5] p-6 dark:bg-green-900/30">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                            <Sparkles className="h-4 w-4" />
                                            <span>ARTICLES</span>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Become a</p>
                                            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                                Regular
                                                <br />
                                                Reader
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Stay updated with the latest insights and tutorials
                                            </p>
                                        </div>
                                        <div className="mt-6 font-serif text-3xl font-bold text-gray-900 dark:text-white">{blogs.total} posts</div>
                                    </div>

                                    {/* Second Featured Post */}
                                    {otherPosts[0] && (
                                        <div
                                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl"
                                            onClick={() => router.visit(`/blog/${otherPosts[0].slug}`)}
                                        >
                                            {otherPosts[0].display_image ? (
                                                <img
                                                    src={otherPosts[0].display_image}
                                                    alt={otherPosts[0].title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-[#F5E6D3] dark:bg-gray-700">
                                                    <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            )}

                                            {/* View count */}
                                            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                                <Eye className="h-3 w-3" />
                                                {otherPosts[0].view_count || 0}
                                            </div>

                                            <div className="absolute right-4 bottom-4 left-4">
                                                <h3 className="line-clamp-2 text-lg font-bold text-white drop-shadow-lg">{otherPosts[0].title}</h3>
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100">
                                                <ArrowUpRight className="h-4 w-4 text-gray-900" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* All Posts Section */}
                    <section id="all-posts" className="bg-white py-16 dark:bg-gray-800">
                        <div className="container mx-auto px-4">
                            {/* Section Header */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                    <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">All Articles</h2>
                                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                </div>
                                <p className="text-center text-gray-500 dark:text-gray-400">
                                    Browse through {blogs.total} article{blogs.total !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {blogs.data.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">No posts found</h3>
                                    <p className="mb-6 text-gray-500 dark:text-gray-400">We're working on some great content. Check back soon!</p>
                                    <Button onClick={() => router.visit('/')} className="rounded-full bg-gray-900 px-8 text-white hover:bg-gray-800">
                                        Back to Home
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Blog Grid - Magazine Style */}
                                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {blogs.data.map((blog, index) => (
                                            <BlogCard key={blog.id} blog={blog} size={index === 0 ? 'large' : 'normal'} />
                                        ))}
                                    </div>

                                    {/* Pagination - Magazine Style */}
                                    {blogs.last_page > 1 && (
                                        <div className="mt-16 flex justify-center">
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: blogs.last_page }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => router.visit(`/blog?page=${page}`)}
                                                        className={`h-10 w-10 rounded-full font-medium transition-all ${
                                                            page === blogs.current_page
                                                                ? 'bg-gray-900 text-white'
                                                                : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                                        }`}
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

                    {/* CTA Section */}
                    <section className="bg-gray-900 py-16">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">Stay in the loop</h2>
                            <p className="mx-auto mb-8 max-w-md text-gray-400">
                                Get notified about new articles and insights. No spam, just quality content.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button className="rounded-full bg-white px-8 text-gray-900 hover:bg-gray-100" onClick={() => router.visit('/')}>
                                    Back to Home
                                </Button>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
