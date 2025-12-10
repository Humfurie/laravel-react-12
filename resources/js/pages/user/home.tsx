import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import HomeProjects from '@/components/home/sections/HomeProjects';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { ExperienceSection } from '@/components/home/sections/ExperienceSection';
import { publicNavItems } from '@/config/navigation';
import { JSX, useEffect, useState } from 'react';

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
    experiences: {
        id: number;
        position: string;
        company: string;
        location: string;
        description: string[];
        start_month: number;
        start_year: number;
        end_month: number | null;
        end_year: number | null;
        is_current_position: boolean;
        user_id: number;
        display_order: number;
        created_at: string;
        updated_at: string;
        image?: {
            id: number;
            name: string;
            path: string;
            url: string;
            imageable_id: number;
            imageable_type: string;
            created_at: string;
            updated_at: string;
        };
    }[];
    expertises: {
        id: number;
        name: string;
        image: string;
        image_url: string;
        category_slug: string;
        order: number;
        is_active: boolean;
        created_at: string;
        updated_at: string;
    }[];
    projects: Project[];
    projectStats: {
        total_projects: number;
        live_projects: number;
    };
}

// Untitled UI style Blog Card - Clean, minimal design
function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
    const handleCardClick = () => {
        router.visit(`/blog/${blog.slug}`);
    };

    return (
        <article
            onClick={handleCardClick}
            className={`group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
                featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
            }`}
        >
            {/* Thumbnail */}
            <div
                className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800 ${featured ? 'aspect-[16/10] md:aspect-auto md:h-full' : 'aspect-[16/10]'}`}
            >
                {blog.featured_image ? (
                    <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                        <span className="text-5xl font-bold text-gray-300 dark:text-gray-600">{blog.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Featured badge */}
                {blog.isPrimary && <Badge className="absolute top-3 left-3 bg-orange-500 text-white hover:bg-orange-600">Featured</Badge>}
            </div>

            {/* Content */}
            <div className={`p-5 ${featured ? 'flex flex-col justify-center md:p-8' : ''}`}>
                {/* Date */}
                {blog.published_at && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}
                    </span>
                )}

                {/* Title */}
                <h3
                    className={`mt-2 font-semibold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400 ${
                        featured ? 'text-xl md:text-2xl' : 'line-clamp-2 text-lg'
                    }`}
                >
                    {blog.title}
                </h3>

                {/* Excerpt */}
                {blog.excerpt && (
                    <p className={`mt-2 text-gray-600 dark:text-gray-400 ${featured ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm'}`}>
                        {blog.excerpt}
                    </p>
                )}

                {/* Read more link */}
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-700 dark:text-orange-400 dark:group-hover:text-orange-300">
                    Read article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </article>
    );
}

export default function Home({ primary = [], latest = [], experiences = [], expertises = [], projects = [], projectStats }: Props): JSX.Element {
    const [isVisible, setIsVisible] = useState(true);
    const [activeItem, setActiveItem] = useState('home');

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

    // Combine and dedupe blogs for display
    const allBlogs = [...primary, ...latest.filter((b) => !primary.find((p) => p.id === b.id))];
    const featuredBlog = primary[0];
    const otherBlogs = allBlogs.filter((b) => b.id !== featuredBlog?.id).slice(0, 5);

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

            {/* Floating Navbar */}
            <nav
                className={`fixed top-3 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-300 ease-in-out sm:top-6 ${
                    isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                }`}
            >
                <div className="rounded-full border border-white/20 bg-white/80 px-3 py-2 shadow-lg backdrop-blur-md sm:px-6 sm:py-4">
                    <div className="flex items-center space-x-1 sm:space-x-3">
                        {publicNavItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.id;

                            return (
                                <Link
                                    key={`${item.id}-${index}`}
                                    href={item.route}
                                    onClick={() => setActiveItem(item.id)}
                                    className={`group relative flex items-center space-x-2 rounded-full px-3 py-2 transition-all duration-200 sm:px-5 sm:py-3 ${
                                        isActive
                                            ? 'scale-105 bg-orange-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                    title={item.label}
                                >
                                    {/* Desktop: Show both icon and text */}
                                    <Icon size={18} className="transition-transform duration-200 group-hover:scale-110 sm:size-5" />
                                    <span className="hidden text-xs font-medium sm:text-sm md:block">{item.label}</span>

                                    {/* Mobile tooltip - only for icon-only buttons */}
                                    <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:hidden">
                                        <div className="rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">{item.label}</div>
                                        <div className="absolute top-0 left-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1 transform border-r-2 border-b-2 border-l-2 border-transparent border-b-gray-900"></div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <HomeBanner />
            <HomeAboutMe />

            {/* Projects Section */}
            {projects.length > 0 && <HomeProjects projects={projects} stats={projectStats} />}

            <HomeExpertise expertises={expertises} />
            <ExperienceSection
                experiences={experiences.map((exp) => ({
                    id: exp.id,
                    company: exp.company,
                    image_url: exp.image?.url || null,
                    location: exp.location,
                    description: Array.isArray(exp.description) ? exp.description : [],
                    position: exp.position,
                    start_month: exp.start_month,
                    start_year: exp.start_year,
                    end_month: exp.end_month,
                    end_year: exp.end_year,
                    is_current_position: exp.is_current_position,
                }))}
            />

            {/* Blog Section - Untitled UI Style */}
            <section className="bg-gray-50 py-16 sm:py-24 dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase dark:text-orange-400">Blog</span>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">Latest Articles</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            Insights, tutorials, and stories about software development, design, and technology.
                        </p>
                    </div>

                    {/* Blog Grid - Untitled UI Layout */}
                    {allBlogs.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Featured post - spans 2 columns on medium+ screens */}
                            {featuredBlog && <BlogCard blog={featuredBlog} featured />}

                            {/* Other posts */}
                            {otherBlogs.map((blog) => (
                                <BlogCard key={String(blog.id)} blog={blog} />
                            ))}
                        </div>
                    )}

                    {/* View All Button */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                        >
                            View All Articles
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
