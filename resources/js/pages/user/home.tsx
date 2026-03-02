import FloatingResumeButton from '@/components/global/FloatingResumeButton';
import SectionTitle from '@/components/global/SectionTitle';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeCTA from '@/components/home/sections/HomeCTA';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import HomeProjects from '@/components/home/sections/HomeProjects';
import StructuredData, { schemas } from '@/components/seo/StructuredData';
import { MotionDiv, MotionItem, MotionStagger } from '@/components/ui/motion';
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

// Blog Card — matches project card pattern: white card, border, thumb + body
function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
    const handleCardClick = () => {
        router.visit(`/blog/${blog.slug}`);
    };

    return (
        <article
            onClick={handleCardClick}
            className={`group cursor-pointer overflow-hidden rounded-xl border border-[#E5E4E0] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C89E] hover:shadow-lg dark:border-[#2A4A3A] dark:bg-[#162820] dark:hover:border-[#5AAF7E] ${
                featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
            }`}
        >
            {/* Thumbnail */}
            <div
                className={`relative overflow-hidden bg-[#F3F1EC] dark:bg-[#0F1A15] ${featured ? 'aspect-[16/10] md:aspect-auto md:min-h-[300px]' : 'aspect-[16/10]'}`}
            >
                {blog.featured_image ? (
                    <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full min-h-[200px] items-center justify-center">
                        <span className="font-display text-5xl text-[#E5E4E0] dark:text-[#2A4A3A]">{blog.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Featured badge */}
                {blog.isPrimary && (
                    <div className="absolute top-3 left-3 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-[#1B3D2F] uppercase">
                        Featured
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`p-7 ${featured ? 'flex flex-col justify-center md:p-10' : ''}`}>
                {/* Date */}
                {blog.published_at && (
                    <span className="text-[0.78rem] text-[#9E9E95]">{formatDistanceToNow(new Date(blog.published_at), { addSuffix: true })}</span>
                )}

                {/* Title */}
                <h3
                    className={`font-display mt-2 leading-tight font-normal text-[#1A1A1A] transition-colors group-hover:text-[#1B3D2F] dark:text-[#E8E6E1] dark:group-hover:text-[#5AAF7E] ${
                        featured ? 'text-[2rem]' : 'line-clamp-2 text-[1.5rem]'
                    }`}
                >
                    {blog.title}
                </h3>

                {/* Excerpt */}
                {blog.excerpt && (
                    <p
                        className={`mt-2.5 text-[0.9rem] leading-[1.7] text-[#6B6B63] dark:text-[#9E9E95] ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}
                    >
                        {blog.excerpt}
                    </p>
                )}

                {/* Read more link */}
                <div className="mt-5 inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[#1B3D2F] transition-all group-hover:gap-3 group-hover:text-[#E8945A] dark:text-[#5AAF7E] dark:group-hover:text-[#E8945A]">
                    Read article
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </article>
    );
}

export default function Home({ primary = [], latest = [], experiences = [], expertises = [], projects = [], profileUser }: Props): JSX.Element {
    // Memoize blog deduplication to avoid O(n×m) on every render
    const allBlogs = useMemo(() => [...primary, ...latest.filter((b) => !primary.find((p) => p.id === b.id))], [primary, latest]);
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
            <StructuredData data={[schemas.person(), schemas.website(), schemas.organization()]} />

            <HomeBanner stats={profileUser?.profile_stats} />
            <HomeAboutMe profileUser={profileUser} />
            <ExperienceSection experiences={transformedExperiences} />

            {/* Projects Section */}
            {projects.length > 0 && <HomeProjects projects={projects} />}

            <HomeExpertise expertises={expertises} />

            {/* Blog Section */}
            <section className="bg-[#F3F1EC] py-[clamp(80px,12vw,160px)] dark:bg-[#0F1A15]">
                <div className="primary-container">
                    {/* Header row: title left, view all right */}
                    <MotionDiv className="mb-[clamp(48px,6vw,80px)] flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
                        <SectionTitle title="Blog" heading="Latest articles" />
                        <Link
                            href="/blog"
                            className="inline-flex shrink-0 items-center gap-2 text-[0.85rem] font-medium text-[#1B3D2F] transition-colors hover:text-[#E8945A] dark:text-[#5AAF7E] dark:hover:text-[#E8945A]"
                        >
                            View all articles
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </MotionDiv>

                    {/* Blog Grid */}
                    {allBlogs.length > 0 && (
                        <MotionStagger staggerDelay={0.1} className="grid gap-6 md:grid-cols-2">
                            {/* Featured post - spans 2 columns */}
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
                </div>
            </section>

            {/* CTA Section with Contact Links */}
            <HomeCTA email={profileUser?.email} socialLinks={profileUser?.social_links ?? undefined} />

            {/* Floating Resume Button */}
            <FloatingResumeButton resumeUrl={profileUser?.resume_path ?? null} />
        </>
    );
}
