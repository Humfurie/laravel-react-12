import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Calendar, User, MapPin, ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { publicNavItems } from '@/config/navigation';
import AdBanner from '@/components/ads/AdBanner';
import StickyAd from '@/components/ads/StickyAd';
import { usePage } from '@inertiajs/react';
import { TravelMap, BlogContentWithMaps } from '@/components/map';
import type { BlogLocation } from '@/types';

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
    locations?: BlogLocation[];
}

interface Props {
    blog: Blog;
}

interface PageProps {
    adsense?: {
        client_id?: string;
        slots?: {
            blog_post_top?: string;
            blog_post_bottom?: string;
            blog_post_sidebar?: string;
        };
    };
}

export default function BlogPost({ blog }: Props) {
    const { props } = usePage<PageProps>();
    const adsense = props.adsense;
    const [isVisible, setIsVisible] = useState(true);
    const [activeItem, setActiveItem] = useState('blog');

    // Check if ads are configured
    const hasAds = adsense?.client_id && (adsense?.slots?.blog_post_top || adsense?.slots?.blog_post_bottom || adsense?.slots?.blog_post_sidebar);

    console.log('is string?', typeof blog.display_image === 'string');
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

    const safeImage = typeof blog.display_image === 'string' ? blog.display_image : '';
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

                {/* Schema.org JSON-LD Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'BlogPosting',
                        headline: blog.title,
                        description: blog.meta_data?.meta_description || blog.excerpt || '',
                        image: blog.display_image || '',
                        datePublished: blog.published_at || blog.created_at,
                        dateModified: blog.updated_at,
                        author: {
                            '@type': 'Person',
                            name: 'Admin',
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: typeof window !== 'undefined' ? document.title.split(' - ')[0] || 'Blog' : 'Blog',
                            logo: {
                                '@type': 'ImageObject',
                                url: typeof window !== 'undefined' ? `${window.location.origin}/images/logo.png` : '',
                            },
                        },
                        mainEntityOfPage: {
                            '@type': 'WebPage',
                            '@id': typeof window !== 'undefined' ? window.location.href : '',
                        },
                        keywords: blog.meta_data?.meta_keywords || '',
                        articleBody: blog.content.replace(/<[^>]*>/g, '').substring(0, 500),
                    })}
                </script>

                {/* Canonical URL */}
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
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
                            {publicNavItems.map((item, index) => {
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
                {/* Hero Section with Featured Image */}
                <section
                    className={`relative overflow-hidden ${blog.display_image ? '' : 'from-brand-orange via-brand-orange to-brand-orange bg-gradient-to-br'}`}
                >
                    {/* Featured Image Background */}
                    {blog.display_image && (
                        <div className="absolute inset-0">
                            <img src={blog.display_image} alt={blog.title} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                        </div>
                    )}

                    {/* Hero Content */}
                    <div className={`relative z-10 py-24 ${blog.display_image ? 'text-white' : 'text-white'}`}>
                        <div className="container mx-auto max-w-4xl px-4">
                            <Link href="/blog">
                                <Button variant="ghost" className="mb-8 border-white/30 text-white hover:bg-white/20">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Blog
                                </Button>
                            </Link>

                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className="border-white/30 bg-white/20 text-white">{blog.status_label}</Badge>
                                    {blog.isPrimary && (
                                        <Badge className="from-brand-orange to-brand-orange border-0 bg-gradient-to-r text-white">⭐ Featured</Badge>
                                    )}
                                </div>

                                <h1 className="text-4xl leading-tight font-bold tracking-tight md:text-6xl">{blog.title}</h1>

                                {blog.excerpt && <p className="max-w-3xl text-xl leading-relaxed text-white/90">{blog.excerpt}</p>}

                                <div className="flex items-center gap-6 text-sm text-white/80">
                                    {blog.published_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(blog.published_at), 'MMMM dd, yyyy')}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Admin</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>👁️ {blog.view_count || 0} views</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Travel Map Section - Auto-shows when locations exist */}
                {blog.locations && blog.locations.length > 0 && (
                    <section className="bg-gray-50 py-12">
                        <div className="container mx-auto max-w-6xl px-4">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Trip Itinerary</h2>
                                    <p className="text-gray-500 text-sm">{blog.locations.length} location{blog.locations.length !== 1 ? 's' : ''} visited</p>
                                </div>
                            </div>

                            {/* Interactive Map */}
                            <div className="rounded-xl overflow-hidden shadow-lg mb-8">
                                <TravelMap
                                    locations={blog.locations}
                                    height="450px"
                                    interactive={true}
                                    showRoute={true}
                                />
                            </div>

                            {/* Location Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {blog.locations.map((location, index) => (
                                    <div
                                        key={location.id}
                                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        {/* Location Image */}
                                        {location.primary_image_url ? (
                                            <img
                                                src={location.primary_image_url}
                                                alt={location.title}
                                                className="w-full h-32 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-gray-300" />
                                            </div>
                                        )}

                                        {/* Location Info */}
                                        <div className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{location.title}</h3>
                                                    {location.address && (
                                                        <p className="text-xs text-gray-500 truncate mt-0.5">{location.address}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {location.description && (
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{location.description}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Blog Content */}
                <section className="bg-white py-16">
                    <div className={`container mx-auto px-4 ${hasAds ? 'max-w-7xl' : 'max-w-4xl'}`}>
                        <div className={`grid grid-cols-1 gap-8 ${hasAds ? 'lg:grid-cols-12' : ''}`}>
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

                                <div className="prose prose-lg prose-headings:text-brand-black prose-p:text-gray-700 prose-a:text-brand-orange prose-strong:text-brand-black w-full max-w-none">
                                    <BlogContentWithMaps
                                        content={blog.content}
                                        locations={blog.locations || []}
                                        className="blog-content w-full leading-relaxed [&_blockquote]:w-full [&_div]:w-full [&_figure]:w-full [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full [&_p]:w-full [&_table]:w-full [&>*]:w-full"
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
                            </div>

                            {/* Sidebar with Sticky Ad - Only show if sidebar ads are configured */}
                            {adsense?.client_id && adsense?.slots?.blog_post_sidebar && (
                                <div className="lg:col-span-4">
                                    <StickyAd adClient={adsense?.client_id} adSlot={adsense?.slots?.blog_post_sidebar} testMode={!adsense?.enabled} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Back to Blog */}
                <section className="from-brand-orange to-brand-orange bg-gradient-to-r py-12">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <Link href="/blog">
                            <Button className="text-brand-orange rounded-xl bg-white px-8 py-3 shadow-lg hover:bg-gray-100">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to All Posts
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>

            <Footer />
        </>
    );
}
