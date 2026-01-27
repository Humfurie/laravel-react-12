import { Badge } from '@/components/ui/badge';
import type { ContributionWeek, Project, ProjectCategory, ProjectStatus } from '@/types/project';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import { memo } from 'react';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
    size?: 'normal' | 'large';
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'live':
            return 'bg-green-500';
        case 'development':
            return 'bg-yellow-500';
        case 'maintenance':
            return 'bg-orange-500';
        case 'archived':
            return 'bg-gray-500';
        default:
            return 'bg-gray-500';
    }
};

const getCategoryColor = (category: ProjectCategory) => {
    switch (category) {
        case 'web_app':
            return 'bg-blue-100 text-blue-700';
        case 'mobile_app':
            return 'bg-purple-100 text-purple-700';
        case 'api':
            return 'bg-indigo-100 text-indigo-700';
        case 'library':
            return 'bg-pink-100 text-pink-700';
        case 'cli':
            return 'bg-cyan-100 text-cyan-700';
        case 'design':
            return 'bg-rose-100 text-rose-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

function MiniContributionGraph({ calendar }: { calendar: ContributionWeek[] }) {
    const recentWeeks = calendar.slice(-12);

    if (!recentWeeks || recentWeeks.length === 0) {
        return null;
    }

    const getColor = (count: number): string => {
        if (count === 0) return '#ebedf0';
        if (count <= 3) return '#9be9a8';
        if (count <= 6) return '#40c463';
        if (count <= 9) return '#30a14e';
        return '#216e39';
    };

    return (
        <div className="flex gap-[2px]">
            {recentWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.contributionDays.map((day, dayIndex) => (
                        <div
                            key={dayIndex}
                            className="h-[6px] w-[6px] rounded-[1px]"
                            style={{
                                backgroundColor: day.color || getColor(day.contributionCount),
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export const ProjectCard = memo(function ProjectCard({ project, onClick, size = 'normal' }: ProjectCardProps) {
    const isLarge = size === 'large';

    return (
        <article className={`group cursor-pointer ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`} onClick={onClick}>
            {/* Image Container */}
            <div className={`relative overflow-hidden rounded-2xl bg-[#F5F5F3] ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
                {project.thumbnail_url ? (
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                        <span className="font-serif text-6xl font-bold text-gray-300">{project.title.charAt(0).toUpperCase()}</span>
                    </div>
                )}

                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(project.status)} ring-2 ring-white`} />
                </div>

                {/* Featured badge */}
                {project.is_featured && (
                    <Badge className="absolute top-4 left-4 rounded-full border-0 bg-[#88C0A8] px-3 py-1 text-white">Featured</Badge>
                )}

                {/* Date badge */}
                {project.started_at && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 backdrop-blur-sm">
                        {new Date(project.started_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                )}

                {/* Arrow Link - appears on hover */}
                <div className="absolute right-4 bottom-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4 text-gray-900" />
                </div>

                {/* Quick links overlay */}
                {(project.links?.demo_url || project.links?.repo_url) && (
                    <div className="absolute top-4 left-4 flex -translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        {project.links?.demo_url && !project.is_featured && (
                            <a
                                href={project.links.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
                                title="View Demo"
                            >
                                <Globe className="h-4 w-4 text-gray-700" />
                            </a>
                        )}
                        {project.links?.repo_url && (
                            <a
                                href={project.links.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
                                title="View Repository"
                            >
                                <Github className="h-4 w-4 text-gray-700" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`mt-4 ${isLarge ? 'md:mt-6' : ''}`}>
                {/* Category */}
                <Badge variant="secondary" className={`rounded-full border-0 text-xs font-medium ${getCategoryColor(project.category)}`}>
                    {project.category_label}
                </Badge>

                {/* Title */}
                <h3
                    className={`mt-2 line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-gray-600 ${isLarge ? 'text-2xl md:text-3xl' : 'text-lg'}`}
                >
                    {project.title}
                </h3>

                {/* Description */}
                {project.short_description && (
                    <p className={`mt-2 line-clamp-2 text-gray-500 ${isLarge ? 'text-base' : 'text-sm'}`}>{project.short_description}</p>
                )}

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, isLarge ? 5 : 3).map((tech) => (
                            <span key={tech} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400">
                                {tech}
                            </span>
                        ))}
                        {project.tech_stack.length > (isLarge ? 5 : 3) && (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400">
                                +{project.tech_stack.length - (isLarge ? 5 : 3)}
                            </span>
                        )}
                    </div>
                )}

                {/* Mini Contribution Graph */}
                {project.metrics?.contribution_calendar?.calendar && (
                    <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">GitHub Activity</span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                {project.metrics.contribution_calendar.total_contributions}
                            </span>
                        </div>
                        <MiniContributionGraph calendar={project.metrics.contribution_calendar.calendar} />
                    </div>
                )}

                {/* Author (for non-owner projects) */}
                {project.author && (
                    <div className="mt-2 flex items-center gap-2">
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
                    </div>
                )}
            </div>
        </article>
    );
});
