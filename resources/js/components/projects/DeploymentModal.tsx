import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Deployment } from '@/types/deployment';
import { format } from 'date-fns';
import { ExternalLink, Globe } from 'lucide-react';

interface DeploymentModalProps {
    deployment: Deployment | null;
    open: boolean;
    onClose: () => void;
}

export function DeploymentModal({ deployment, open, onClose }: DeploymentModalProps) {
    if (!deployment) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <Badge variant="outline" className="mb-2">
                                {deployment.client_type_label}
                            </Badge>
                            <DialogTitle className="text-2xl">{deployment.title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {deployment.status_label}
                                {deployment.deployed_at && (
                                    <span className="ml-2">Deployed {format(new Date(deployment.deployed_at), 'MMM yyyy')}</span>
                                )}
                                <span className="ml-2">&middot; Client: {deployment.client_name}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Image */}
                {deployment.thumbnail_url && (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                        <img src={deployment.thumbnail_url} alt={deployment.title} className="h-full w-full object-cover" />
                    </div>
                )}

                {/* Gallery thumbnails */}
                {deployment.images && deployment.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {deployment.images.slice(0, 6).map((image) => (
                            <img
                                key={image.id}
                                src={image.thumbnail_urls?.small || image.url}
                                alt=""
                                className="h-16 w-24 flex-shrink-0 cursor-pointer rounded-lg border object-cover transition-opacity hover:opacity-80"
                            />
                        ))}
                    </div>
                )}

                {/* Industry */}
                {deployment.industry && (
                    <div className="text-sm text-[#6B6B63] dark:text-[#9E9E95]">
                        <span className="font-medium text-[#1A1A1A] dark:text-[#E8E6E1]">Industry:</span> {deployment.industry}
                    </div>
                )}

                {/* Tech Stack */}
                {deployment.tech_stack && deployment.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {deployment.tech_stack.map((tech) => (
                            <Badge key={tech} variant="secondary">
                                {tech}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Description - admin-only content, same pattern as ProjectModal */}
                {deployment.description && (
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: deployment.description }} />
                )}

                {/* Challenges Solved */}
                {deployment.challenges_solved && deployment.challenges_solved.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-[#1A1A1A] dark:text-[#E8E6E1]">Challenges Solved</h4>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-[#6B6B63] dark:text-[#9E9E95]">
                            {deployment.challenges_solved.map((challenge, index) => (
                                <li key={index}>{challenge}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                    {deployment.live_url && (
                        <Button asChild>
                            <a href={deployment.live_url} target="_blank" rel="noopener noreferrer">
                                <Globe className="mr-2 h-4 w-4" />
                                Live Site
                            </a>
                        </Button>
                    )}
                    {deployment.demo_url && (
                        <Button variant="outline" asChild>
                            <a href={deployment.demo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Demo
                            </a>
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
