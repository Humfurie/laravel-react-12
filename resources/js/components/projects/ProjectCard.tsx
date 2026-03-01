import type { ContributionWeek, Project, ProjectStatus } from '@/types/project';
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
            return 'bg-[#5AAF7E]';
        case 'development':
            return 'bg-[#E8945A]';
        case 'maintenance':
            return 'bg-[#F5C89E]';
        case 'archived':
            return 'bg-[#9E9E95]';
        default:
            return 'bg-[#9E9E95]';
    }
};

function MiniContributionGraph({ calendar }: { calendar: ContributionWeek[] }) {
    const recentWeeks = calendar.slice(-12);

    if (!recentWeeks || recentWeeks.length === 0) {
        return null;
    }

    const getColor = (count: number): string => {
        if (count === 0) return '#E5E4E0';
        if (count <= 3) return '#B8D8C7';
        if (count <= 6) return '#5AAF7E';
        if (count <= 9) return '#2A5E44';
        return '#1B3D2F';
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
            <div
                className={`relative overflow-hidden rounded-xl bg-[#F3F1EC] dark:bg-[#0F1A15] ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
            >
                {project.thumbnail_url ? (
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="font-display text-5xl text-[#E5E4E0] dark:text-[#2A4A3A]">
                            {project.title.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Status indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${getStatusColor(project.status)} ring-2 ring-white dark:ring-[#162820]`}
                    />
                </div>

                {/* Featured badge */}
                {project.is_featured && (
                    <div className="absolute top-4 left-4 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide uppercase text-[#1B3D2F]">
                        Featured
                    </div>
                )}

                {/* Date badge */}
                {project.started_at && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A] backdrop-blur-sm dark:bg-[#162820]/90 dark:text-[#E8E6E1]">
                        {new Date(project.started_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                )}

                {/* Arrow Link - appears on hover */}
                <div className="absolute right-4 bottom-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#162820]">
                    <ArrowUpRight className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
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
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white dark:bg-[#162820]/90 dark:hover:bg-[#162820]"
                                title="View Demo"
                            >
                                <Globe className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                            </a>
                        )}
                        {project.links?.repo_url && (
                            <a
                                href={project.links.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white dark:bg-[#162820]/90 dark:hover:bg-[#162820]"
                                title="View Repository"
                            >
                                <Github className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`mt-4 ${isLarge ? 'md:mt-6' : ''}`}>
                {/* Category */}
                {project.category_label && (
                    <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-[#1B3D2F] dark:text-[#5AAF7E]">
                        {project.category_label}
                    </span>
                )}

                {/* Title */}
                <h3
                    className={`mt-2 line-clamp-2 font-display font-normal text-[#1A1A1A] transition-colors group-hover:text-[#1B3D2F] dark:text-[#E8E6E1] dark:group-hover:text-[#5AAF7E] ${isLarge ? 'text-[2rem] md:text-[2.5rem]' : 'text-[1.5rem]'}`}
                >
                    {project.title}
                </h3>

                {/* Description */}
                {project.short_description && (
                    <p className={`mt-2 line-clamp-2 text-[#6B6B63] dark:text-[#9E9E95] ${isLarge ? 'text-[0.9rem]' : 'text-[0.85rem]'}`}>
                        {project.short_description}
                    </p>
                )}

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.tech_stack.slice(0, isLarge ? 5 : 3).map((tech) => (
                            <span
                                key={tech}
                                className="rounded-full border border-[#E5E4E0] bg-white px-2.5 py-0.5 text-[0.78rem] font-medium text-[#6B6B63] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95]"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.tech_stack.length > (isLarge ? 5 : 3) && (
                            <span className="rounded-full border border-[#E5E4E0] bg-white px-2.5 py-0.5 text-[0.78rem] font-medium text-[#9E9E95] dark:border-[#2A4A3A] dark:bg-[#162820]">
                                +{project.tech_stack.length - (isLarge ? 5 : 3)}
                            </span>
                        )}
                    </div>
                )}

                {/* Mini Contribution Graph */}
                {project.metrics?.contribution_calendar?.calendar && (
                    <div className="mt-3 border-t border-[#E5E4E0] pt-3 dark:border-[#2A4A3A]">
                        <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-xs text-[#9E9E95]">GitHub Activity</span>
                            <span className="text-xs font-medium text-[#6B6B63] dark:text-[#9E9E95]">
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
                        <span className="text-xs text-[#9E9E95]">By {project.author.login || 'Unknown'}</span>
                    </div>
                )}
            </div>
        </article>
    );
});
