import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Home as HomeIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Footer from '@/components/global/Footer';
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
    blog: Blog;
}
export default function BlogPost({ blog }: Props) {
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
            <Head title={String(blog.meta_data?.meta_title || blog.title || '')}>
                <meta
                    name="description"
                    content={String(blog.meta_data?.meta_description || blog.excerpt || '')}
                />
                <meta
                    name="keywords"
                    content={String(blog.meta_data?.meta_keywords || '')}
                />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content={String(blog.meta_data?.meta_title || blog.title || '')} />
                <meta property="og:description" content={String(blog.meta_data?.meta_description || blog.excerpt || '')} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                {blog.display_image && (
                    <>
                        <meta property="og:image" content={String(blog.display_image)} />
                        <meta property="og:image:width" content="1200" />
                        <meta property="og:image:height" content="630" />
                        <meta property="og:image:alt" content={String(blog.title || '')} />
                    </>
                )}
                {blog.published_at && <meta property="article:published_time" content={String(blog.published_at)} />}

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={String(blog.meta_data?.meta_title || blog.title || '')} />
                <meta name="twitter:description" content={String(blog.meta_data?.meta_description || blog.excerpt || '')} />
                {blog.display_image && <meta name="twitter:image" content={String(blog.display_image)} />}
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
                {/* Hero Section with Featured Image */}
                <section className={`relative overflow-hidden ${blog.display_image ? '' : 'bg-gradient-to-br from-brand-orange via-brand-gold to-brand-orange'}`}>
                    {/* Featured Image Background */}
                    {blog.display_image && (
                        <div className="absolute inset-0">
                            <img
                                src={blog.display_image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                        </div>
                    )}

                    {/* Hero Content */}
                    <div className={`relative z-10 py-24 ${blog.display_image ? 'text-white' : 'text-white'}`}>
                        <div className="container mx-auto px-4 max-w-4xl">
                            <Link href="/blog">
                                <Button variant="ghost" className="mb-8 text-white hover:bg-white/20 border-white/30">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Blog
                                </Button>
                            </Link>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className="bg-white/20 text-white border-white/30">{blog.status_label}</Badge>
                                    {blog.isPrimary && (
                                        <Badge className="bg-gradient-to-r from-brand-orange to-brand-gold text-white border-0">
                                            ⭐ Featured
                                        </Badge>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                                    {blog.title}
                                </h1>

                                {blog.excerpt && (
                                    <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                                        {blog.excerpt}
                                    </p>
                                )}

                                <div className="flex items-center gap-6 text-sm text-white/80">
                                    {blog.published_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {format(new Date(blog.published_at), 'MMMM dd, yyyy')}
                                            </span>
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


                {/* Blog Content */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="prose prose-lg max-w-none prose-headings:text-brand-black prose-p:text-gray-700 prose-a:text-brand-orange prose-strong:text-brand-black w-full">
                            <div
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                                className="blog-content leading-relaxed w-full [&>*]:w-full [&_img]:w-full [&_img]:max-w-full [&_img]:h-auto [&_p]:w-full [&_div]:w-full [&_figure]:w-full [&_table]:w-full [&_blockquote]:w-full"
                            />
                        </div>
                    </div>
                </section>

                {/* Back to Blog */}
                <section className="py-12 bg-gradient-to-r from-brand-orange to-brand-gold">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <Link href="/blog">
                            <Button className="bg-white text-brand-orange hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg">
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
