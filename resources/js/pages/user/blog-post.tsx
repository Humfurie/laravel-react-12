import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import StructuredData, { schemas } from '@/components/seo/StructuredData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, Eye, Share2, Sparkles } from 'lucide-react';
import AdBanner from '@/components/ads/AdBanner';
import StickyAd from '@/components/ads/StickyAd';

// TipTap Node Styles for proper blog content formatting
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

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
    blog: Blog;
}

interface PageProps {
    adsense?: {
        enabled?: boolean;
        client_id?: string;
        slots?: {
            blog_post_top?: string;
            blog_post_bottom?: string;
            blog_post_sidebar?: string;
        };
    };
    [key: string]: unknown;
}

// Calculate reading time
function getReadingTime(content: string): number {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

export default function BlogPost({ blog }: Props) {
    const { props } = usePage<PageProps>();
    const adsense = props.adsense;
    const readingTime = getReadingTime(blog.content);

    // Check if ads are configured
    const hasAds = adsense?.client_id && (adsense?.slots?.blog_post_top || adsense?.slots?.blog_post_bottom || adsense?.slots?.blog_post_sidebar);

    const safeImage = typeof blog.display_image === 'string' ? blog.display_image : '';

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt || '',
                    url: window.location.href,
                });
            } catch {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <>
            <Head title={String(blog.meta_data?.meta_title || blog.title || '')}>
                <meta name="description" content={String(blog.meta_data?.meta_description || blog.excerpt || '')} />
                <meta name="keywords" content={String(blog.meta_data?.meta_keywords || '')} />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content={String(blog.meta_data?.meta_title || blog.title || '')} />
                <meta property="og:description" content={String(blog.meta_data?.meta_description || blog.excerpt || '')} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                {safeImage && <meta property="og:image" content={safeImage} />}
                {safeImage && <meta property="og:image:width" content="1200" />}
                {safeImage && <meta property="og:image:height" content="630" />}
                {safeImage && <meta property="og:image:alt" content={blog.title || ''} />}

                {blog.published_at && <meta property="article:published_time" content={String(blog.published_at)} />}

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={String(blog.meta_data?.meta_title || blog.title || '')} />
                <meta name="twitter:description" content={String(blog.meta_data?.meta_description || blog.excerpt || '')} />
                {blog.display_image && <meta name="twitter:image" content={String(blog.display_image)} />}


                {/* Canonical URL */}
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
            </Head>

            {/* Structured Data */}
            <StructuredData
                data={[
                    schemas.blogPosting({
                        headline: blog.title,
                        description: blog.meta_data?.meta_description || blog.excerpt || undefined,
                        image: blog.display_image || undefined,
                        datePublished: blog.published_at || blog.created_at,
                        dateModified: blog.updated_at,
                        url: `https://humfurie.org/blog/${blog.slug}`,
                        keywords: blog.meta_data?.meta_keywords || undefined,
                        articleBody: blog.content.replace(/<[^>]*>/g, '').substring(0, 500),
                    }),
                    schemas.breadcrumbList([
                        { name: 'Home', url: 'https://humfurie.org' },
                        { name: 'Blog', url: 'https://humfurie.org/blog' },
                        { name: blog.title, url: `https://humfurie.org/blog/${blog.slug}` },
                    ]),
                ]}
            />

            <div className="min-h-screen bg-[#FAFAF8] dark:bg-neutral-950">
                <FloatingNav currentPage="blog" />

                <main className="pt-20">
                    {/* Article Header */}
                    <article>
                        {/* Hero Section */}
                        <header className="container mx-auto px-4 py-8 md:py-12">
                            {/* Back Link */}
                            <Link
                                href="/blog"
                                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to all articles
                            </Link>

                            {/* Article Meta */}
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                {blog.isPrimary && (
                                    <Badge className="rounded-full border-0 bg-orange-500 px-3 py-1 text-white">
                                        <Sparkles className="mr-1 h-3 w-3" />
                                        Featured
                                    </Badge>
                                )}
                                {blog.published_at && (
                                    <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(blog.published_at), 'MMMM dd, yyyy')}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Clock className="h-4 w-4" />
                                    {readingTime} min read
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                    <Eye className="h-4 w-4" />
                                    {blog.view_count || 0} views
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="mb-6 font-serif text-4xl leading-tight font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
                                {blog.title}
                            </h1>

                            {/* Excerpt */}
                            {blog.excerpt && <p className="mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-300">{blog.excerpt}</p>}

                            {/* Share Button */}
                            <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </header>

                        {/* Featured Image */}
                        {blog.display_image && (
                            <div className="container mx-auto px-4">
                                <div className="aspect-[21/9] overflow-hidden rounded-3xl">
                                    <img src={blog.display_image} alt={blog.title} className="h-full w-full object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Article Content */}
                        <div className={`container mx-auto px-4 py-12 ${hasAds ? 'max-w-7xl' : 'max-w-4xl'}`}>
                            <div className={`grid grid-cols-1 gap-12 ${hasAds ? 'lg:grid-cols-12' : ''}`}>
                                {/* Main Content */}
                                <div className={hasAds ? 'lg:col-span-8' : ''}>
                                    {/* Top Banner Ad */}
                                    <AdBanner
                                        adClient={adsense?.client_id}
                                        adSlot={adsense?.slots?.blog_post_top}
                                        adFormat="horizontal"
                                        testMode={!adsense?.enabled}
                                        className="mb-8"
                                    />

                                    {/* Article Body */}
                                    <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-neutral-900 dark:shadow-neutral-800/20 md:p-12">
                                        <div
                                            className="tiptap ProseMirror prose prose-lg prose-gray dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl max-w-none [&_p:empty]:hidden"
                                            dangerouslySetInnerHTML={{ __html: blog.content }}
                                        />
                                    </div>

                                    {/* Bottom Banner Ad */}
                                    <AdBanner
                                        adClient={adsense?.client_id}
                                        adSlot={adsense?.slots?.blog_post_bottom}
                                        adFormat="horizontal"
                                        testMode={!adsense?.enabled}
                                        className="mt-8"
                                    />

                                    {/* Author Card */}
                                    <div className="mt-12 flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-neutral-900 dark:shadow-neutral-800/20">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                            <img src="/logo.png" alt="Author" className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Written by</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">Humfurie</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Software Developer</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar with Sticky Ad */}
                                {adsense?.client_id && adsense?.slots?.blog_post_sidebar && (
                                    <div className="lg:col-span-4">
                                        <StickyAd
                                            adClient={adsense?.client_id}
                                            adSlot={adsense?.slots?.blog_post_sidebar}
                                            testMode={!adsense?.enabled}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </article>

                    {/* Back to Blog CTA */}
                    <section className="container mx-auto px-4 pb-12">
                        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center text-white md:p-12">
                            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Enjoyed this article?</h2>
                            <p className="mx-auto mb-6 max-w-lg text-white/80">
                                Check out more articles on software development, design, and technology.
                            </p>
                            <Link href="/blog">
                                <Button variant="secondary" size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to All Articles
                                </Button>
                            </Link>
                        </div>
                    </section>
                </main>
            </div>

            <Footer />
        </>
    );
}
