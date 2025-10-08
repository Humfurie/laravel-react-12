import Footer from '@/components/global/Footer';
import FloatingNav from '@/components/floating-nav';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import { Head, router } from '@inertiajs/react';
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
        <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg" onClick={handleCardClick}>
            {blog.featured_image && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img src={blog.featured_image} alt={blog.title} className="h-full w-full object-cover" />
                </div>
            )}
            <CardContent className="p-4">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {blog.isPrimary && (
                            <Badge variant="secondary" className="text-xs">
                                Featured
                            </Badge>
                        )}
                    </div>

                    <h3 className="line-clamp-2 text-sm font-semibold">{blog.title}</h3>

                    {blog.excerpt && <p className="text-muted-foreground line-clamp-2 text-xs">{truncateText(blog.excerpt, 80)}</p>}

                    <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
                        {blog.published_at && <span>{formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}</span>}
                        <span className="text-primary hover:underline">Read →</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Home({ primary = [], latest = [] }: Props): JSX.Element {
    return (
        <>
            <Head title="Portfolio & Blog">
                <meta
                    name="description"
                    content="Professional portfolio and blog featuring expertise in software development, design, and technology insights."
                />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content="Portfolio & Blog" />
                <meta
                    property="og:description"
                    content="Professional portfolio and blog featuring expertise in software development, design, and technology insights."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="/images/og-default.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Portfolio & Blog - Professional Development Portfolio" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Portfolio & Blog" />
                <meta
                    name="twitter:description"
                    content="Professional portfolio and blog featuring expertise in software development, design, and technology insights."
                />
                <meta name="twitter:image" content="/images/og-default.jpg" />
            </Head>

            <FloatingNav currentPage="home" />

            <HomeBanner />
            <HomeAboutMe />
            {/*<HomeProjects />*/}
            <HomeExpertise />
            <ExperienceSection />
            {/*<HomeCTA />*/}

            {/* Blog Section */}
            <section className="bg-muted/30 py-16">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold">From Our Blog</h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl">
                            Discover insights, tutorials, and stories. Stay updated with the latest trends and best practices.
                        </p>
                    </div>

                    {/* Primary/Featured Posts */}
                    {primary.length > 0 && (
                        <div className="mb-12">
                            <h3 className="mb-6 text-center text-xl font-semibold">Featured Posts</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {primary.map((blog) => (
                                    <BlogCard key={String(blog.id)} blog={blog} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Latest Posts */}
                    {latest.length > 0 && (
                        <div className="mb-8">
                            <h3 className="mb-6 text-center text-xl font-semibold">Latest Posts</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {latest.slice(0, 6).map((blog) => (
                                    <BlogCard key={String(blog.id)} blog={blog} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* View All Button */}
                    <div className="text-center">
                        <button
                            onClick={() => router.visit('/blog')}
                            className="from-brand-orange to-brand-gold hover:from-brand-orange/90 hover:to-brand-gold/90 inline-flex transform items-center rounded-xl bg-gradient-to-r px-6 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105"
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
