import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

import { JSX } from 'react';
import { ExperienceSection } from '@/components/home/sections/ExperienceSection';

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

export default function Contact({ primary = [], latest = [] }: Props): JSX.Element {
    const tabs = [
        { id: 'home', label: 'Home', icon: '🏠', route: '/' },
        { id: 'contact', label: 'Contact', icon: '📧', route: '/contact', active: true },
        { id: 'blog', label: 'Blog', icon: '📝', route: '/blog' }
    ];

    return (
        <>
            <Head title="Contact" />

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
