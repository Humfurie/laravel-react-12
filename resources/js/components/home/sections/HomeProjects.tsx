import ContributorStack from '@/components/github/ContributorStack';
import SectionTitle from '@/components/global/SectionTitle';
import { MotionDiv, MotionItem, MotionStagger } from '@/components/ui/motion';
import type { Project } from '@/types/project';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, Github, Globe } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

// Stable event handler to prevent inline function recreation
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

interface HomeProjectsProps {
    projects: Project[];
    stats?: {
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
    authorUsername?: string;
}

// Regular project card — white card, 12px radius, border, thumb + body
const ProjectCard = memo(function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
    const handleClick = useCallback(() => {
        router.visit('/projects');
    }, []);

    return (
        <article
            onClick={handleClick}
            className={`group cursor-pointer overflow-hidden rounded-xl border border-[#E5E4E0] bg-white transition-all duration-400 hover:-translate-y-1 hover:border-[#F5C89E] hover:shadow-lg dark:border-[#2A4A3A] dark:bg-[#162820] dark:hover:border-[#5AAF7E] ${
                featured ? 'col-span-1 grid md:col-span-2 md:grid-cols-2' : ''
            }`}
        >
            {/* Thumbnail */}
            <div
                className={`relative overflow-hidden bg-[#F3F1EC] dark:bg-[#0F1A15] ${featured ? 'aspect-[16/10] md:aspect-auto md:min-h-[340px]' : 'aspect-[16/10]'}`}
            >
                {project.thumbnail_url ? (
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="font-display text-5xl text-[#E5E4E0] dark:text-[#2A4A3A]">{project.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Status badges */}
                {project.status === 'live' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#FDF5EE] px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-[#E8945A] uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#E8945A]" />
                        Live
                    </div>
                )}

                {project.is_featured && (
                    <div className="absolute top-3 left-3 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-[#1B3D2F] uppercase">
                        Featured
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`p-7 ${featured ? 'flex flex-col justify-center md:p-10' : ''}`}>
                {/* Category */}
                {project.category_label && (
                    <span className="text-[0.7rem] font-semibold tracking-[0.08em] text-[#1B3D2F] uppercase dark:text-[#5AAF7E]">
                        {project.category_label}
                    </span>
                )}

                {/* Title */}
                <h3
                    className={`font-display mt-2 leading-tight font-normal text-[#1A1A1A] transition-colors group-hover:text-[#1B3D2F] dark:text-[#E8E6E1] dark:group-hover:text-[#5AAF7E] ${
                        featured ? 'text-[2rem]' : 'line-clamp-2 text-[1.5rem]'
                    }`}
                >
                    {project.title}
                </h3>

                {/* Description */}
                <p className={`mt-2.5 text-[0.9rem] leading-[1.7] text-[#6B6B63] dark:text-[#9E9E95] ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
                    {project.short_description}
                </p>

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, featured ? 5 : 3).map((tech) => (
                            <span
                                key={tech}
                                className="rounded-full border border-[#E5E4E0] bg-white px-2.5 py-0.5 text-[0.78rem] font-medium text-[#6B6B63] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95]"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.tech_stack.length > (featured ? 5 : 3) && (
                            <span className="rounded-full border border-[#E5E4E0] bg-white px-2.5 py-0.5 text-[0.78rem] font-medium text-[#9E9E95] dark:border-[#2A4A3A] dark:bg-[#162820]">
                                +{project.tech_stack.length - (featured ? 5 : 3)}
                            </span>
                        )}
                    </div>
                )}

                {/* Quick Links */}
                {(project.links?.demo_url || project.links?.repo_url) && (
                    <div className="mt-5 flex items-center gap-4">
                        {project.links?.demo_url && (
                            <a
                                href={project.links.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stopPropagation}
                                className="inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[#1B3D2F] transition-all hover:gap-3 hover:text-[#E8945A] dark:text-[#5AAF7E] dark:hover:text-[#E8945A]"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                Live Site
                            </a>
                        )}
                        {project.links?.repo_url && (
                            <a
                                href={project.links.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stopPropagation}
                                className="inline-flex items-center gap-1.5 text-[0.85rem] font-medium text-[#1B3D2F] transition-all hover:gap-3 hover:text-[#E8945A] dark:text-[#5AAF7E] dark:hover:text-[#E8945A]"
                            >
                                <Github className="h-3.5 w-3.5" />
                                Source
                            </a>
                        )}
                    </div>
                )}

                {/* Contributors */}
                {project.github_data?.contributors && project.github_data.contributors.length > 0 && (
                    <div className="mt-4 border-t border-[#E5E4E0] pt-4 dark:border-[#2A4A3A]">
                        <ContributorStack contributors={project.github_data.contributors} maxDisplay={5} />
                    </div>
                )}
            </div>
        </article>
    );
});

const HomeProjects = ({ projects }: HomeProjectsProps) => {
    const featuredProjects = useMemo(() => projects.filter((p) => p.is_featured), [projects]);
    const featuredProject = featuredProjects[0];
    const regularProjects = useMemo(() => featuredProjects.slice(1), [featuredProjects]);

    if (projects.length === 0) return null;

    return (
        <section className="py-[clamp(80px,12vw,160px)]">
            <div className="primary-container">
                {/* Header row: title left, view all right */}
                <MotionDiv className="mb-[clamp(48px,6vw,80px)] flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
                    <SectionTitle title="Projects" heading="What I've built" />
                    <Link
                        href="/projects"
                        className="inline-flex shrink-0 items-center gap-2 text-[0.85rem] font-medium text-[#1B3D2F] transition-colors hover:text-[#E8945A] dark:text-[#5AAF7E] dark:hover:text-[#E8945A]"
                    >
                        View all projects
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </MotionDiv>

                {/* Project Grid — featured card spans 2 columns, rest 1 each */}
                <MotionStagger staggerDelay={0.1} className="grid gap-6 md:grid-cols-2">
                    {featuredProject && (
                        <MotionItem variant="fadeUp">
                            <ProjectCard project={featuredProject} featured />
                        </MotionItem>
                    )}
                    {regularProjects.map((project) => (
                        <MotionItem key={project.id} variant="fadeUp">
                            <ProjectCard project={project} />
                        </MotionItem>
                    ))}
                </MotionStagger>
            </div>
        </section>
    );
};

export default HomeProjects;
