import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';
import { ChevronLeft, ChevronRight, Github, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectCarouselProps {
    projects: Project[];
    onProjectClick: (project: Project) => void;
}

export function ProjectCarousel({ projects, onProjectClick }: ProjectCarouselProps) {
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
            className="from-primary/10 via-primary/5 relative overflow-hidden rounded-2xl bg-gradient-to-br to-transparent"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="grid gap-8 p-8 md:grid-cols-2 md:p-12">
                {/* Content */}
                <div className="flex flex-col justify-center space-y-4">
                    <Badge variant="secondary" className="w-fit">
                        Featured Project
                    </Badge>
                    <h2 className="text-3xl font-bold md:text-4xl">{currentProject.title}</h2>
                    <p className="text-muted-foreground text-lg">{currentProject.short_description}</p>
                    <div className="flex flex-wrap gap-2">
                        {currentProject.tech_stack?.slice(0, 5).map((tech) => (
                            <Badge key={tech} variant="outline">
                                {tech}
                            </Badge>
                        ))}
                        {currentProject.tech_stack && currentProject.tech_stack.length > 5 && (
                            <Badge variant="outline">+{currentProject.tech_stack.length - 5}</Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button onClick={() => onProjectClick(currentProject)}>View Details</Button>
                        {currentProject.links?.demo_url && (
                            <Button variant="outline" asChild>
                                <a href={currentProject.links.demo_url} target="_blank" rel="noopener noreferrer">
                                    <Globe className="mr-2 h-4 w-4" />
                                    Live Demo
                                </a>
                            </Button>
                        )}
                        {currentProject.links?.repo_url && (
                            <Button variant="ghost" asChild>
                                <a href={currentProject.links.repo_url} target="_blank" rel="noopener noreferrer">
                                    <Github className="mr-2 h-4 w-4" />
                                    Source
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Image */}
                <div
                    className="relative aspect-video cursor-pointer overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
                    onClick={() => onProjectClick(currentProject)}
                >
                    {currentProject.thumbnail_url ? (
                        <img
                            src={currentProject.thumbnail_url}
                            alt={currentProject.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                    ) : (
                        <div className="bg-muted flex h-full items-center justify-center">
                            <span className="text-muted-foreground text-6xl font-bold">{currentProject.title.charAt(0).toUpperCase()}</span>
                        </div>
                    )}
                    {/* Status badge */}
                    <Badge className="absolute bottom-4 left-4" variant={currentProject.status === 'live' ? 'default' : 'secondary'}>
                        {currentProject.status_label}
                    </Badge>
                </div>
            </div>

            {/* Navigation */}
            {projects.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/80 hover:bg-background absolute top-1/2 left-4 -translate-y-1/2 backdrop-blur-sm"
                        onClick={goToPrevious}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/80 hover:bg-background absolute top-1/2 right-4 -translate-y-1/2 backdrop-blur-sm"
                        onClick={goToNext}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                        {projects.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex ? 'bg-primary w-6' : 'bg-primary/30 hover:bg-primary/50'
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
}
