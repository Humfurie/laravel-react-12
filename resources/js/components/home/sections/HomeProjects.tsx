import ContributorStack from '@/components/github/ContributorStack';
import GitHubStatsHeader from '@/components/github/GitHubStatsHeader';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, ChevronLeft, ChevronRight, Github, Globe } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

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

// Memoized to prevent re-renders when parent state changes
const ProjectCard = memo(function ProjectCard({ project, authorUsername }: { project: Project; authorUsername?: string }) {
    const handleClick = useCallback(() => {
        router.visit(`/projects`);
    }, []);

    return (
        <article
                onClick={handleClick}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 dark:bg-gray-800">
                    {project.thumbnail_url ? (
                        <img
                            src={project.thumbnail_url}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                            <span className="text-5xl font-bold text-gray-300 dark:text-gray-600">{project.title.charAt(0).toUpperCase()}</span>
                        </div>
                    )}

                    {/* Status indicator */}
                    {project.status === 'live' && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-green-700 backdrop-blur-sm dark:bg-gray-900/90 dark:text-green-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Live
                        </div>
                    )}

                    {/* Featured badge */}
                    {project.is_featured && <Badge className="absolute top-3 left-3 bg-orange-500 text-white hover:bg-orange-600">Featured</Badge>}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Category */}
                    <span className="text-xs font-semibold tracking-wider text-orange-600 uppercase dark:text-orange-400">
                        {project.category_label}
                    </span>

                    {/* Title */}
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                        {project.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{project.short_description}</p>

                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                            {project.tech_stack.slice(0, 3).map((tech) => (
                                <span
                                    key={tech}
                                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.tech_stack.length > 3 && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                                    +{project.tech_stack.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Quick Links */}
                    {(project.links?.demo_url || project.links?.repo_url) && (
                        <div className="mt-4 flex items-center gap-3">
                            {project.links?.demo_url && (
                                <a
                                    href={project.links.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={stopPropagation}
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                                >
                                    <Globe className="h-3.5 w-3.5" />
                                    Demo
                                </a>
                            )}
                            {project.links?.repo_url && (
                                <a
                                    href={project.links.repo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={stopPropagation}
                                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                                >
                                    <Github className="h-3.5 w-3.5" />
                                    Code
                                </a>
                            )}
                        </div>
                    )}

                    {/* Contributors */}
                    {project.github_data?.contributors && project.github_data.contributors.length > 0 && (
                        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                            <ContributorStack contributors={project.github_data.contributors} authorUsername={authorUsername} maxDisplay={5} />
                        </div>
                    )}

                    {/* Author badge for non-owner projects */}
                    {project.author && (
                        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                            {project.author.avatar_url && (
                                <img
                                    src={project.author.avatar_url}
                                    alt={project.author.login || 'Author'}
                                    className="h-5 w-5 rounded-full"
                                />
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                By {project.author.login || 'Unknown'}
                            </span>
                            {project.ownership_type === 'deployed' && (
                                <Badge variant="secondary" className="ml-auto rounded-full text-[10px]">
                                    Deployed by me
                                </Badge>
                            )}
                            {project.ownership_type === 'contributor' && (
                                <Badge variant="secondary" className="ml-auto rounded-full text-[10px]">
                                    Contributor
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </article>
    );
});

// Memoized carousel component
const FeaturedProjectCarousel = memo(function FeaturedProjectCarousel({
    projects,
    onProjectClick,
}: {
    projects: Project[];
    onProjectClick: (project: Project) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying || projects.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % projects.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, projects.length]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
        setIsAutoPlaying(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
        setIsAutoPlaying(false);
    };

    if (projects.length === 0) return null;

    const currentProject = projects[currentIndex];

    return (
        <div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
                {/* Content */}
                <div className="flex flex-col justify-center space-y-5">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">
                            Featured Project
                        </Badge>
                        {currentProject.status === 'live' && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                Live
                            </span>
                        )}
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">{currentProject.title}</h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400">{currentProject.short_description}</p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                        {currentProject.tech_stack?.slice(0, 5).map((tech) => (
                            <span
                                key={tech}
                                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                                {tech}
                            </span>
                        ))}
                        {currentProject.tech_stack && currentProject.tech_stack.length > 5 && (
                            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                                +{currentProject.tech_stack.length - 5}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <button
                            onClick={() => onProjectClick(currentProject)}
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-600"
                        >
                            View Details
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        {currentProject.links?.demo_url && (
                            <a
                                href={currentProject.links.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Globe className="h-4 w-4" />
                                Live Demo
                            </a>
                        )}
                        {currentProject.links?.repo_url && (
                            <a
                                href={currentProject.links.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <Github className="h-4 w-4" />
                                Source
                            </a>
                        )}
                    </div>
                </div>

                {/* Image */}
                <div
                    className="relative aspect-video cursor-pointer overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                    onClick={() => onProjectClick(currentProject)}
                >
                    {currentProject.thumbnail_url ? (
                        <img
                            src={currentProject.thumbnail_url}
                            alt={currentProject.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                            <span className="text-6xl font-bold text-gray-300 dark:text-gray-600">
                                {currentProject.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            {projects.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 text-gray-700 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 text-gray-700 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                        {projects.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600'
                                }`}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsAutoPlaying(false);
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
});

const HomeProjects = ({ projects, stats, githubStats, authorUsername }: HomeProjectsProps) => {
    // Memoize filtered project lists to avoid recalculation on every render
    const featuredProjects = useMemo(() => projects.filter((p) => p.is_featured), [projects]);
    const regularProjects = useMemo(() => projects.slice(0, 6), [projects]);

    // Stable callback reference
    const handleProjectClick = useCallback(() => {
        router.visit('/projects');
    }, []);

    if (projects.length === 0) {
        return null;
    }

    return (
        <section className="bg-white py-16 sm:py-24 dark:bg-gray-950">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="text-sm font-semibold tracking-wider text-orange-600 uppercase dark:text-orange-400">Portfolio</span>
                    <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">Featured Projects</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                        A showcase of projects I've built, deployed, and contributed to
                    </p>
                </div>

                {/* GitHub Stats */}
                {githubStats && <GitHubStatsHeader githubStats={githubStats} />}

                {/* Featured Carousel */}
                {featuredProjects.length > 0 && (
                    <div className="mb-16">
                        <FeaturedProjectCarousel projects={featuredProjects} onProjectClick={handleProjectClick} />
                    </div>
                )}

                {/* Project Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {regularProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} authorUsername={authorUsername} />
                    ))}
                </div>

                {/* Stats Bar */}
                {stats && (
                    <div className="mt-12 flex justify-center gap-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_projects}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Projects</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{stats.live_projects}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Live</div>
                        </div>
                    </div>
                )}

                {/* View All Button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    >
                        View All Projects
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HomeProjects;
