import StructuredData, { schemas } from '@/components/seo/StructuredData';
import { Button } from '@/components/ui/button';
import { MotionDiv, MotionItem, MotionStagger } from '@/components/ui/motion';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ArrowUpRight, BookOpen, Briefcase, Calendar, Eye, Pencil, Sparkles } from 'lucide-react';
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
    tags: string[] | null;
    isPrimary: boolean;
    sort_order: number;
    view_count: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    status_label: string;
}

type BlogCategory = 'portfolio' | 'personal';

interface Props {
    blogs: {
        data: Blog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    category: BlogCategory;
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
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#F3F1EC] dark:bg-[#0F1A15]">
                    {blog.display_image ? (
                        <img
                            src={blog.display_image}
                            alt={blog.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-24 w-24 text-[#E5E4E0] dark:text-[#2A4A3A]" />
                        </div>
                    )}

                    {/* Date Badge */}
                    {blog.published_at && (
                        <div className="absolute top-6 left-6 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A] backdrop-blur-sm dark:bg-[#162820]/90 dark:text-[#E8E6E1]">
                            {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    )}

                    {/* Featured Badge */}
                    {blog.isPrimary && (
                        <div className="absolute top-6 right-6 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-[#1B3D2F] uppercase">
                            Featured
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                        <h2 className="font-display mb-2 line-clamp-2 text-2xl font-normal text-white md:text-3xl">{blog.title}</h2>
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
                    <div className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-[#162820]">
                        <ArrowUpRight className="h-5 w-5 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                    </div>
                </div>
            </article>
        );
    }

    return (
        <article className={`group cursor-pointer ${isLarge ? 'md:col-span-2' : ''}`} onClick={handleCardClick}>
            {/* Image Container */}
            <div className={`relative overflow-hidden rounded-xl bg-[#F3F1EC] dark:bg-[#0F1A15] ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
                {blog.display_image ? (
                    <img
                        src={blog.display_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="font-display text-5xl text-[#E5E4E0] dark:text-[#2A4A3A]">{blog.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Featured badge */}
                {blog.isPrimary && (
                    <div className="absolute top-4 left-4 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-[#1B3D2F] uppercase">
                        Featured
                    </div>
                )}

                {/* Date badge */}
                {blog.published_at && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A] backdrop-blur-sm dark:bg-[#162820]/90 dark:text-[#E8E6E1]">
                        {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                )}

                {/* View count badge */}
                <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    <Eye className="h-3 w-3" />
                    {viewCount}
                </div>

                {/* Arrow Link - appears on hover */}
                <div className="absolute top-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#162820]">
                    <ArrowUpRight className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                </div>
            </div>

            {/* Content */}
            <div className={`mt-4 ${isLarge ? 'md:mt-6' : ''}`}>
                {/* Title */}
                <h3
                    className={`font-display line-clamp-2 font-normal text-[#1A1A1A] transition-colors group-hover:text-[#1B3D2F] dark:text-[#E8E6E1] dark:group-hover:text-[#5AAF7E] ${isLarge ? 'text-[2rem] md:text-[2.5rem]' : 'text-[1.5rem]'}`}
                >
                    {blog.title}
                </h3>

                {/* Excerpt */}
                {blog.excerpt && (
                    <p className={`mt-2 line-clamp-2 text-[#6B6B63] dark:text-[#9E9E95] ${isLarge ? 'text-[0.9rem]' : 'text-[0.85rem]'}`}>
                        {truncateText(blog.excerpt, isLarge ? 200 : 100)}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-3 flex items-center gap-4 text-xs text-[#9E9E95]">
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

const categories: { key: BlogCategory; label: string; icon: typeof Briefcase }[] = [
    { key: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { key: 'personal', label: 'Personal', icon: Pencil },
];

const CategoryTabs = memo(function CategoryTabs({ active }: { active: BlogCategory }) {
    const [optimistic, setOptimistic] = useState<BlogCategory>(active);

    // Sync when server confirms the new category
    useEffect(() => {
        setOptimistic(active);
    }, [active]);

    const handleTabClick = (category: BlogCategory) => {
        if (category === optimistic) return;
        setOptimistic(category); // Instant visual switch
        router.get(`/blog`, { category }, { preserveState: true, only: ['blogs', 'category'] });
    };

    return (
        <div className="flex items-center gap-1 rounded-full bg-[#F3F1EC] p-1 dark:bg-[#162820]">
            {categories.map(({ key, label, icon: Icon }) => (
                <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                        optimistic === key
                            ? 'bg-[#1B3D2F] text-white shadow-sm dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                            : 'text-[#6B6B63] hover:text-[#1B3D2F] dark:text-[#9E9E95] dark:hover:text-[#5AAF7E]'
                    }`}
                >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </button>
            ))}
        </div>
    );
});

export default function BlogIndex({ blogs, category }: Props) {
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

    const categoryLabel = category === 'portfolio' ? 'Portfolio' : 'Personal';

    // Get featured post and rest
    const featuredPost = blogs.data.find((blog) => blog.isPrimary) || blogs.data[0];
    const otherPosts = blogs.data.filter((blog) => blog.id !== featuredPost?.id);

    return (
        <>
            <Head title={`${category === 'portfolio' ? 'Portfolio' : 'Personal'} Blog`}>
                <meta
                    name="description"
                    content={
                        category === 'portfolio'
                            ? 'Portfolio articles by Humphrey Singculan on software development, Laravel, React, and full-stack engineering.'
                            : 'Personal blog posts by Humphrey Singculan — thoughts, experiences, and stories beyond code.'
                    }
                />
                <link rel="canonical" href="https://humfurie.org/blog" />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content={`${categoryLabel} Blog`} />
                <meta property="og:description" content={`Browse ${categoryLabel.toLowerCase()} articles by Humphrey Singculan.`} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="https://humfurie.org/images/humphrey-banner.webp?v=1" />
                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${categoryLabel} Blog`} />
                <meta name="twitter:description" content={`Browse ${categoryLabel.toLowerCase()} articles by Humphrey Singculan.`} />

                {/* Schema.org JSON-LD Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: `${categoryLabel} Blog`,
                        description: `Browse ${categoryLabel.toLowerCase()} articles by Humphrey Singculan.`,
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
                <link rel="canonical" href="https://humfurie.org/blog" />
            </Head>

            <StructuredData data={[schemas.organization()]} />

            <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0A1210]">
                <main className="pt-20">
                    {/* Magazine Hero Section */}
                    <section className="primary-container py-8 md:py-12">
                        {/* Section Header */}
                        <MotionDiv className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h1 className="font-display text-5xl font-light tracking-tight text-[#1A1A1A] md:text-6xl lg:text-7xl dark:text-[#E8E6E1]">
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
                                                className="text-[#E5E4E0] dark:text-[#2A4A3A]"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <CategoryTabs active={category} />
                                <Link
                                    href="#all-posts"
                                    className="hidden items-center gap-2 text-sm font-medium text-[#9E9E95] transition-colors hover:text-[#1B3D2F] md:flex dark:hover:text-[#5AAF7E]"
                                >
                                    See all posts
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </MotionDiv>

                        {/* Featured Grid - Magazine Layout */}
                        {featuredPost && (
                            <MotionDiv delay={0.1} className="grid gap-6 lg:grid-cols-3">
                                {/* Main Featured Card */}
                                <BlogCard blog={featuredPost} size="featured" />

                                {/* Sidebar Cards */}
                                <div className="flex flex-col gap-6">
                                    {/* Info Card */}
                                    <div className="flex flex-col justify-between rounded-xl bg-[#E4EDE8] p-6 dark:bg-[#1B3D2F]/20">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[#6B6B63] dark:text-[#9E9E95]">
                                            <Sparkles className="h-4 w-4" />
                                            <span>ARTICLES</span>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm text-[#6B6B63] dark:text-[#9E9E95]">Become a</p>
                                            <h3 className="font-display mb-4 text-2xl font-normal text-[#1A1A1A] dark:text-[#E8E6E1]">
                                                Regular
                                                <br />
                                                Reader
                                            </h3>
                                            <p className="text-sm text-[#6B6B63] dark:text-[#9E9E95]">
                                                Stay updated with the latest insights and tutorials
                                            </p>
                                        </div>
                                        <div className="font-display mt-6 text-3xl font-normal text-[#1A1A1A] dark:text-[#E8E6E1]">
                                            {blogs.total} posts
                                        </div>
                                    </div>

                                    {/* Second Featured Post */}
                                    {otherPosts[0] && (
                                        <div
                                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
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
                                                <div className="flex h-full items-center justify-center bg-[#FDF5EE] dark:bg-[#162820]">
                                                    <BookOpen className="h-16 w-16 text-[#E8945A]/40" />
                                                </div>
                                            )}

                                            {/* View count */}
                                            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                                <Eye className="h-3 w-3" />
                                                {otherPosts[0].view_count || 0}
                                            </div>

                                            <div className="absolute right-4 bottom-4 left-4">
                                                <h3 className="font-display line-clamp-2 text-lg font-normal text-white drop-shadow-lg">
                                                    {otherPosts[0].title}
                                                </h3>
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-[#162820]">
                                                <ArrowUpRight className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </MotionDiv>
                        )}
                    </section>

                    {/* All Posts Section */}
                    <section id="all-posts" className="bg-white py-16 dark:bg-[#0F1A15]">
                        <div className="primary-container">
                            {/* Section Header */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-[#E5E4E0] dark:bg-[#2A4A3A]" />
                                    <h2 className="font-display text-3xl font-normal text-[#1A1A1A] dark:text-[#E8E6E1]">
                                        {category === 'portfolio' ? 'Portfolio' : 'Personal'} Articles
                                    </h2>
                                    <div className="h-px flex-1 bg-[#E5E4E0] dark:bg-[#2A4A3A]" />
                                </div>
                                <p className="text-center text-[#6B6B63] dark:text-[#9E9E95]">
                                    Browse through {blogs.total} article{blogs.total !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {blogs.data.length === 0 ? (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F1EC] dark:bg-[#162820]">
                                        <BookOpen className="h-8 w-8 text-[#9E9E95]" />
                                    </div>
                                    <h3 className="mb-2 text-2xl font-semibold text-[#1A1A1A] dark:text-[#E8E6E1]">No posts found</h3>
                                    <p className="mb-6 text-[#6B6B63] dark:text-[#9E9E95]">We're working on some great content. Check back soon!</p>
                                    <Button
                                        onClick={() => router.visit('/')}
                                        className="rounded-full bg-[#1B3D2F] px-8 text-white hover:bg-[#2A5E44] dark:bg-[#5AAF7E] dark:text-[#0F1A15] dark:hover:bg-[#5AAF7E]/90"
                                    >
                                        Back to Home
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Blog Grid - Magazine Style */}
                                    <MotionStagger staggerDelay={0.05} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {blogs.data.map((blog, index) => (
                                            <MotionItem key={blog.id} variant="fadeUp">
                                                <BlogCard blog={blog} size={index === 0 ? 'large' : 'normal'} />
                                            </MotionItem>
                                        ))}
                                    </MotionStagger>

                                    {/* Pagination - Magazine Style */}
                                    {blogs.last_page > 1 && (
                                        <div className="mt-16 flex justify-center">
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: blogs.last_page }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => router.visit(`/blog?category=${category}&page=${page}`)}
                                                        className={`h-10 w-10 rounded-full font-medium transition-all ${
                                                            page === blogs.current_page
                                                                ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                                                : 'border border-[#E5E4E0] bg-white text-[#6B6B63] hover:border-[#1B3D2F] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]'
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
                    <section className="border-t border-[#E5E4E0] bg-white py-16 dark:border-[#2A4A3A] dark:bg-[#0A1210]">
                        <MotionDiv className="primary-container text-center">
                            <p className="mb-3 text-sm font-medium tracking-wide text-[#E8945A] uppercase">Blog</p>
                            <h2 className="font-display mb-4 text-2xl font-normal text-[#1A1A1A] md:text-3xl dark:text-[#E8E6E1]">
                                Thanks for reading
                            </h2>
                            <p className="mx-auto mb-8 max-w-md text-[#6B6B63] dark:text-[#9E9E95]">
                                Thoughts on development, tech, and whatever else is on my mind.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button
                                    className="rounded-full bg-[#1B3D2F] px-6 py-3 text-sm font-medium text-white hover:bg-[#2A5E44] dark:bg-[#5AAF7E] dark:text-[#0F1A15] dark:hover:bg-[#5AAF7E]/90"
                                    onClick={() => router.visit('/')}
                                >
                                    Back to Home
                                </Button>
                            </div>
                        </MotionDiv>
                    </section>
                </main>
            </div>
        </>
    );
}
