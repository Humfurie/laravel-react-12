import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Project } from '@/types/project';
import { Download, ExternalLink, Github, Globe, Star, Users } from 'lucide-react';

interface ProjectModalProps {
    project: Project | null;
    open: boolean;
    onClose: () => void;
}

export function ProjectModal({ project, open, onClose }: ProjectModalProps) {
    if (!project) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <Badge variant="outline" className="mb-2">
                                {project.category_label}
                            </Badge>
                            <DialogTitle className="text-2xl">{project.title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {project.status_label}
                                {project.started_at && (
                                    <span className="ml-2">
                                        {project.completed_at ? `${project.started_at} - ${project.completed_at}` : `Started ${project.started_at}`}
                                    </span>
                                )}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Image */}
                {project.thumbnail_url && (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                        <img src={project.thumbnail_url} alt={project.title} className="h-full w-full object-cover" />
                    </div>
                )}

                {/* Gallery thumbnails */}
                {project.images && project.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {project.images.slice(0, 6).map((image) => (
                            <img
                                key={image.id}
                                src={image.thumbnail_urls?.small || image.url}
                                alt=""
                                className="h-16 w-24 flex-shrink-0 cursor-pointer rounded-lg border object-cover transition-opacity hover:opacity-80"
                            />
                        ))}
                    </div>
                )}

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {project.tech_stack.map((tech) => (
                            <Badge key={tech} variant="secondary">
                                {tech}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: project.description }} />

                {/* Metrics */}
                {project.metrics && Object.keys(project.metrics).some((k) => project.metrics?.[k as keyof typeof project.metrics]) && (
                    <div className="flex gap-6 border-t border-b py-4">
                        {project.metrics.users !== undefined && project.metrics.users !== null && (
                            <div className="flex items-center gap-2">
                                <Users className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{project.metrics.users.toLocaleString()}</span>
                                <span className="text-muted-foreground text-sm">users</span>
                            </div>
                        )}
                        {project.metrics.stars !== undefined && project.metrics.stars !== null && (
                            <div className="flex items-center gap-2">
                                <Star className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{project.metrics.stars.toLocaleString()}</span>
                                <span className="text-muted-foreground text-sm">stars</span>
                            </div>
                        )}
                        {project.metrics.downloads !== undefined && project.metrics.downloads !== null && (
                            <div className="flex items-center gap-2">
                                <Download className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{project.metrics.downloads.toLocaleString()}</span>
                                <span className="text-muted-foreground text-sm">downloads</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Testimonials */}
                {project.testimonials && project.testimonials.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="font-semibold">Testimonials</h4>
                        {project.testimonials.map((testimonial, index) => (
                            <blockquote key={index} className="border-primary border-l-2 pl-4">
                                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                                <footer className="mt-2 text-sm">
                                    <strong>{testimonial.name}</strong>
                                    {testimonial.role && <span className="text-muted-foreground">, {testimonial.role}</span>}
                                    {testimonial.company && <span className="text-muted-foreground"> at {testimonial.company}</span>}
                                </footer>
                            </blockquote>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                    {project.links?.demo_url && (
                        <Button asChild>
                            <a href={project.links.demo_url} target="_blank" rel="noopener noreferrer">
                                <Globe className="mr-2 h-4 w-4" />
                                View Live
                            </a>
                        </Button>
                    )}
                    {project.links?.repo_url && (
                        <Button variant="outline" asChild>
                            <a href={project.links.repo_url} target="_blank" rel="noopener noreferrer">
                                <Github className="mr-2 h-4 w-4" />
                                Source Code
                            </a>
                        </Button>
                    )}
                    {project.links?.docs_url && (
                        <Button variant="outline" asChild>
                            <a href={project.links.docs_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Documentation
                            </a>
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
