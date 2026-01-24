import FloatingNav from '@/components/floating-nav';
import FloatingResumeButton from '@/components/global/FloatingResumeButton';
import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeCTA from '@/components/home/sections/HomeCTA';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import HomeProjects from '@/components/home/sections/HomeProjects';
import StructuredData, { schemas } from '@/components/seo/StructuredData';
import { Badge } from '@/components/ui/badge';
import { MotionDiv, MotionStagger, MotionItem } from '@/components/ui/motion';
import type { Project } from '@/types/project';
import { Head, Link, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';

import { ExperienceSection } from '@/components/home/sections/ExperienceSection';
import { JSX, useMemo } from 'react';

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
    githubStats?: {
        total_contributions: number;
        commits: number;
        pull_requests: number;
        issues: number;
        calendar: Array<{
            contributionDays: Array<{
                contributionCount: number;
                date: string;
                color: string;
            }>;
        }>;
    } | null;
    profileUser?: {
        name: string;
        headline: string | null;
        bio: string | null;
        about: string | null;
        profile_stats: { label: string; value: string }[];
        about_image_path: string | null;
        email?: string;
        resume_path?: string | null;
        social_links?: {
            linkedin?: string;
            calendar?: string;
        } | null;
        github_username?: string | null;
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
            className={`group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
                featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
            }`}
        >
            {/* Thumbnail */}
            <div
                className={`relative overflow-hidden bg-gray-50 dark:bg-gray-900 ${featured ? 'aspect-[16/10] md:aspect-auto md:h-full' : 'aspect-[16/10]'}`}
            >
                {blog.featured_image ? (
                    <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950">
                        <span className="text-5xl font-bold text-gray-300 dark:text-gray-500">{blog.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Featured badge */}
                {blog.isPrimary && <Badge className="absolute top-3 left-3 bg-orange-500 text-white hover:bg-orange-600">Featured</Badge>}
            </div>

            {/* Content */}
            <div className={`p-5 ${featured ? 'flex flex-col justify-center md:p-8' : ''}`}>
                {/* Date */}
                {blog.published_at && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
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
                    <p className={`mt-2 text-gray-600 dark:text-gray-300 ${featured ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm'}`}>
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

export default function Home({
    primary = [],
    latest = [],
    experiences = [],
    expertises = [],
    projects = [],
    projectStats,
    githubStats,
    profileUser,
}: Props): JSX.Element {
    // Memoize blog deduplication to avoid O(n×m) on every render
    const allBlogs = useMemo(
        () => [...primary, ...latest.filter((b) => !primary.find((p) => p.id === b.id))],
        [primary, latest],
    );
    const featuredBlog = primary[0];
    const otherBlogs = useMemo(() => allBlogs.filter((b) => b.id !== featuredBlog?.id).slice(0, 5), [allBlogs, featuredBlog?.id]);

    // Memoize experience data transformation to avoid creating new objects every render
    const transformedExperiences = useMemo(
        () =>
            experiences.map((exp) => ({
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
            })),
        [experiences],
    );

    return (
        <>
            <Head title="Humphrey Singculan - Software Engineer | Blog & Portfolio">
                <meta
                    name="description"
                    content="Humphrey Singculan is a Software Engineer specializing in Laravel, React, and full-stack development. Explore projects, blog posts, and professional portfolio."
                />

                {/* Canonical URL */}
                <link rel="canonical" href="https://humfurie.org" />

                {/* Open Graph Meta Tags for Social Media */}
                <meta property="og:title" content="Humphrey Singculan - Software Engineer | Blog & Portfolio" />
                <meta
                    property="og:description"
                    content="Humphrey Singculan is a Software Engineer specializing in Laravel, React, and full-stack development. Explore projects, blog posts, and professional portfolio."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://humfurie.org" />
                <meta property="og:image" content="https://humfurie.org/images/og-default.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Humphrey Singculan - Software Engineer Portfolio" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Humphrey Singculan - Software Engineer | Blog & Portfolio" />
                <meta
                    name="twitter:description"
                    content="Humphrey Singculan is a Software Engineer specializing in Laravel, React, and full-stack development. Explore projects, blog posts, and professional portfolio."
                />
                <meta name="twitter:image" content="https://humfurie.org/images/og-default.jpg" />
            </Head>

            {/* Structured Data for SEO */}
            <StructuredData data={[schemas.person(), schemas.website()]} />

            <FloatingNav currentPage="home" />

            <HomeBanner />
            <HomeAboutMe profileUser={profileUser} />
            <ExperienceSection experiences={transformedExperiences} />

            {/* Projects Section */}
            {projects.length > 0 && (
                <HomeProjects
                    projects={projects}
                    stats={projectStats}
                    githubStats={githubStats}
                    authorUsername={profileUser?.github_username ?? undefined}
                />
            )}

            <HomeExpertise expertises={expertises} />

            {/* Blog Section - Untitled UI Style */}
            <section className="bg-gray-50 py-16 sm:py-24 dark:bg-gray-950">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <MotionDiv className="mb-12 text-center">
                        <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase dark:text-orange-400">Blog</span>
                        <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">Latest Articles</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            Insights, tutorials, and stories about software development, design, and technology.
                        </p>
                    </MotionDiv>

                    {/* Blog Grid - Untitled UI Layout */}
                    {allBlogs.length > 0 && (
                        <MotionStagger staggerDelay={0.1} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Featured post - spans 2 columns on medium+ screens */}
                            {featuredBlog && (
                                <MotionItem variant="fadeUp">
                                    <BlogCard blog={featuredBlog} featured />
                                </MotionItem>
                            )}

                            {/* Other posts */}
                            {otherBlogs.map((blog) => (
                                <MotionItem key={String(blog.id)} variant="fadeUp">
                                    <BlogCard blog={blog} />
                                </MotionItem>
                            ))}
                        </MotionStagger>
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

            {/* CTA Section with Contact Links */}
            <HomeCTA email={profileUser?.email} socialLinks={profileUser?.social_links ?? undefined} />

            <Footer />

            {/* Floating Resume Button */}
            <FloatingResumeButton resumeUrl={profileUser?.resume_path ?? null} />
        </>
    );
}
