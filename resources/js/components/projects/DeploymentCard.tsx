import { ImageCarousel } from '@/components/projects/ImageCarousel';
import type { Deployment, DeploymentImage, DeploymentStatus } from '@/types/deployment';
import type { ProjectImage } from '@/types/project';
import { ArrowUpRight, Globe } from 'lucide-react';
import { memo } from 'react';

interface DeploymentCardProps {
    deployment: Deployment;
    onClick: () => void;
    size?: 'normal' | 'large';
}

const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
        case 'active':
            return 'bg-[#5AAF7E]';
        case 'maintenance':
            return 'bg-[#F5C89E]';
        case 'archived':
            return 'bg-[#9E9E95]';
        default:
            return 'bg-[#9E9E95]';
    }
};

function toProjectImages(images: DeploymentImage[]): ProjectImage[] {
    return images as unknown as ProjectImage[];
}

export const DeploymentCard = memo(function DeploymentCard({ deployment, onClick, size = 'normal' }: DeploymentCardProps) {
    const isLarge = size === 'large';
    const hasImages = deployment.images && deployment.images.length > 0;

    return (
        <article className={`group cursor-pointer ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}`} onClick={onClick}>
            {hasImages ? (
                <div className="relative">
                    <ImageCarousel
                        images={toProjectImages(deployment.images!)}
                        title={deployment.title}
                        className={`rounded-xl ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
                    />

                    {/* Status indicator */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${getStatusColor(deployment.status)} ring-2 ring-white dark:ring-[#162820]`}
                        />
                    </div>

                    {/* Client type badge */}
                    <div className="absolute top-4 left-4 z-10 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide uppercase text-[#1B3D2F]">
                        {deployment.client_type_label}
                    </div>

                    {/* Deployed date */}
                    {deployment.deployed_at && (
                        <div className="absolute bottom-4 left-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A] backdrop-blur-sm dark:bg-[#162820]/90 dark:text-[#E8E6E1]">
                            {new Date(deployment.deployed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                    )}

                    {/* Arrow Link */}
                    <div className="absolute right-4 bottom-4 z-10 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#162820]">
                        <ArrowUpRight className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                    </div>

                    {/* Live URL overlay */}
                    {deployment.live_url && (
                        <div className="absolute top-4 left-4 z-10 flex -translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            <a
                                href={deployment.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white dark:bg-[#162820]/90 dark:hover:bg-[#162820]"
                                title="View Live Site"
                            >
                                <Globe className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`relative overflow-hidden rounded-xl bg-[#F3F1EC] dark:bg-[#0F1A15] ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
                >
                    {deployment.thumbnail_url ? (
                        <img
                            src={deployment.thumbnail_url}
                            alt={deployment.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <span className="font-display text-5xl text-[#E5E4E0] dark:text-[#2A4A3A]">
                                {deployment.title.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* Status indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${getStatusColor(deployment.status)} ring-2 ring-white dark:ring-[#162820]`}
                        />
                    </div>

                    {/* Client type badge */}
                    <div className="absolute top-4 left-4 rounded-full bg-[#E4EDE8] px-3 py-1 text-[0.7rem] font-semibold tracking-wide uppercase text-[#1B3D2F]">
                        {deployment.client_type_label}
                    </div>

                    {/* Deployed date */}
                    {deployment.deployed_at && (
                        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-[#1A1A1A] backdrop-blur-sm dark:bg-[#162820]/90 dark:text-[#E8E6E1]">
                            {new Date(deployment.deployed_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                    )}

                    {/* Arrow Link */}
                    <div className="absolute right-4 bottom-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-[#162820]">
                        <ArrowUpRight className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`mt-4 ${isLarge ? 'md:mt-6' : ''}`}>
                {/* Client type */}
                <span className="text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-[#1B3D2F] dark:text-[#5AAF7E]">
                    {deployment.client_type_label}
                </span>

                {/* Title */}
                <h3
                    className={`mt-2 line-clamp-2 font-display font-normal text-[#1A1A1A] transition-colors group-hover:text-[#1B3D2F] dark:text-[#E8E6E1] dark:group-hover:text-[#5AAF7E] ${isLarge ? 'text-[2rem] md:text-[2.5rem]' : 'text-[1.5rem]'}`}
                >
                    {deployment.title}
                </h3>

                {/* Client name */}
                <p className={`mt-1 text-[#9E9E95] ${isLarge ? 'text-[0.9rem]' : 'text-[0.85rem]'}`}>
                    for {deployment.client_name}
                </p>

                {/* Tech Stack */}
                {deployment.tech_stack && deployment.tech_stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {deployment.tech_stack.slice(0, isLarge ? 5 : 3).map((tech) => (
                            <span
                                key={tech}
                                className="rounded-full border border-[#E5E4E0] bg-white px-2.5 py-0.5 text-[0.78rem] font-medium text-[#6B6B63] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95]"
                            >
                                {tech}
                            </span>
                        ))}
                        {deployment.tech_stack.length > (isLarge ? 5 : 3) && (
                            <span className="rounded-full border border-[#E5E4E0] bg-white px-2.5 py-0.5 text-[0.78rem] font-medium text-[#9E9E95] dark:border-[#2A4A3A] dark:bg-[#162820]">
                                +{deployment.tech_stack.length - (isLarge ? 5 : 3)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
});
