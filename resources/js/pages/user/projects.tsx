import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectModal } from '@/components/projects/ProjectModal';
import StructuredData, { schemas } from '@/components/seo/StructuredData';
import { MotionDiv, MotionItem, MotionStagger } from '@/components/ui/motion';
import type { Deployment } from '@/types/deployment';
import type { Project, ProjectCategory } from '@/types/project';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Code2, Github, Sparkles } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type TabKey = 'owned' | 'deployments' | 'contributed';

interface Props {
    featured: Project[];
    projects: { owned: Project[]; contributed: Project[] };
    deployments: Deployment[];
    categories: Record<ProjectCategory, string>;
    techStack: string[];
    ownershipTypes: Record<string, string>;
}

function getInitialTab(ownershipTypes: Record<string, string>): TabKey {
    if (typeof window === 'undefined') return 'owned';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && tab in ownershipTypes) return tab as TabKey;
    return 'owned';
}

export default function ProjectsShowcase({ featured, projects, deployments, categories, techStack, ownershipTypes }: Props) {
    const [activeTab, setActiveTab] = useState<TabKey>(() => getInitialTab(ownershipTypes));
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTech, setSelectedTech] = useState<string[]>([]);

    const handleTabChange = useCallback((tab: TabKey) => {
        setActiveTab(tab);
        setSelectedCategory(null);
        setSelectedTech([]);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
    }, []);

    const allProjects = useMemo(() => {
        return [...projects.owned, ...projects.contributed];
    }, [projects]);

    const activeProjects = useMemo(() => {
        if (activeTab === 'deployments') {
            return deployments as unknown as Project[];
        }
        return projects[activeTab] ?? [];
    }, [projects, deployments, activeTab]);

    const filteredProjects = useMemo(() => {
        return activeProjects.filter((project) => {
            // Skip category filtering for deployments (they don't have categories)
            if (activeTab !== 'deployments' && selectedCategory && project.category !== selectedCategory) {
                return false;
            }
            if (selectedTech.length > 0) {
                const projectTech = project.tech_stack || [];
                if (!selectedTech.every((tech) => projectTech.includes(tech))) {
                    return false;
                }
            }
            return true;
        });
    }, [activeProjects, selectedCategory, selectedTech, activeTab]);

    const handleProjectClick = useCallback((project: Project) => {
        setSelectedProject(project);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setSelectedProject(null);
    }, []);

    // Get first featured project for hero
    const heroProject = featured[0];
    const sidebarProjects = featured.slice(1, 3);

    return (
        <>
            <Head title="Projects">
                <meta
                    name="description"
                    content="Explore Humphrey Singculan's portfolio of projects - web applications built with Laravel, React, and modern full-stack technologies."
                />
                <link rel="canonical" href="https://humfurie.org/projects" />
                <meta property="og:title" content="Projects - Humphrey Singculan" />
                <meta
                    property="og:description"
                    content="Explore Humphrey Singculan's portfolio of projects - web applications built with Laravel, React, and modern full-stack technologies."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://humfurie.org/projects" />
                <meta property="og:image" content="https://humfurie.org/images/og-default.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Projects - Humphrey Singculan" />
                <meta
                    name="twitter:description"
                    content="Explore Humphrey Singculan's portfolio of projects - web applications built with Laravel, React, and modern full-stack technologies."
                />
            </Head>

            {/* Structured Data */}
            <StructuredData
                data={[
                    schemas.collectionPage({
                        name: 'Projects',
                        description:
                            "Explore Humphrey Singculan's portfolio of projects - web applications built with Laravel, React, and modern full-stack technologies.",
                        url: 'https://humfurie.org/projects',
                    }),
                    schemas.breadcrumbList([
                        { name: 'Home', url: 'https://humfurie.org' },
                        { name: 'Projects', url: 'https://humfurie.org/projects' },
                    ]),
                    schemas.organization(),
                ]}
            />

            <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#0A1210]">
                <main className="pt-20">
                    {/* Magazine Hero Section */}
                    <section className="primary-container py-8 md:py-12">
                        {/* Section Header */}
                        <MotionDiv className="mb-8 flex items-end justify-between">
                            <div>
                                <h1 className="font-display text-5xl font-light tracking-tight text-[#1A1A1A] md:text-6xl lg:text-7xl dark:text-[#E8E6E1]">
                                    Best of the
                                    <br />
                                    <span className="relative">
                                        portfolio
                                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                            <path
                                                d="M1 5.5C47.5 2 154.5 1 199 5.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                className="text-[#E5E4E0] dark:text-[#2A4A3A]"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                            <Link
                                href="#all-projects"
                                className="hidden items-center gap-2 text-sm font-medium text-[#9E9E95] transition-colors hover:text-[#1B3D2F] md:flex dark:hover:text-[#5AAF7E]"
                            >
                                See all projects
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </MotionDiv>

                        {/* Featured Grid - Magazine Layout */}
                        {heroProject && (
                            <MotionDiv delay={0.1} className="grid gap-6 lg:grid-cols-3">
                                {/* Main Featured Card */}
                                <div className="group cursor-pointer lg:col-span-2" onClick={() => handleProjectClick(heroProject)}>
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#F3F1EC] dark:bg-[#162820]">
                                        {heroProject.thumbnail_url ? (
                                            <img
                                                src={heroProject.thumbnail_url}
                                                alt={heroProject.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Code2 className="h-24 w-24 text-[#E5E4E0] dark:text-[#2A4A3A]" />
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        {heroProject.started_at && (
                                            <div className="absolute top-6 left-6 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-[#1A1A1A] backdrop-blur-sm dark:bg-[#162820]/90 dark:text-[#E8E6E1]">
                                                {new Date(heroProject.started_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        <div className="absolute top-6 right-6">
                                            <span className="rounded-full bg-[#E4EDE8] px-4 py-1.5 text-[0.7rem] font-semibold tracking-wide text-[#1B3D2F] uppercase">
                                                {heroProject.category_label}
                                            </span>
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                                            <h2 className="font-display mb-2 text-2xl font-normal text-white md:text-3xl">{heroProject.title}</h2>
                                            <p className="line-clamp-2 max-w-xl text-sm text-white/80 md:text-base">
                                                {heroProject.short_description}
                                            </p>
                                        </div>

                                        {/* Arrow Link */}
                                        <div className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110 dark:bg-[#162820]">
                                            <ArrowUpRight className="h-5 w-5 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Cards */}
                                <div className="flex flex-col gap-6">
                                    {/* Info Card */}
                                    <div className="flex flex-col justify-between rounded-xl bg-[#E4EDE8] p-6 dark:bg-[#162820]">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[#1B3D2F] dark:text-[#5AAF7E]">
                                            <Sparkles className="h-4 w-4" />
                                            <span className="tracking-[0.08em] uppercase">Featured</span>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm text-[#6B6B63] dark:text-[#9E9E95]">Explore my</p>
                                            <h3 className="font-display mb-4 text-2xl font-normal text-[#1A1A1A] dark:text-[#E8E6E1]">
                                                Web & Mobile
                                                <br />
                                                Projects
                                            </h3>
                                            <p className="text-sm text-[#6B6B63] dark:text-[#9E9E95]">
                                                Building innovative solutions with modern technologies
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="mt-6 rounded-full border border-[#1B3D2F] px-5 py-2.5 text-sm font-medium text-[#1B3D2F] transition-colors hover:bg-[#1B3D2F] hover:text-white dark:border-[#5AAF7E] dark:text-[#5AAF7E] dark:hover:bg-[#5AAF7E] dark:hover:text-[#0F1A15]"
                                        >
                                            Learn more
                                        </button>
                                    </div>

                                    {/* Second Featured */}
                                    {sidebarProjects[0] && (
                                        <div
                                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
                                            onClick={() => handleProjectClick(sidebarProjects[0])}
                                        >
                                            {sidebarProjects[0].thumbnail_url ? (
                                                <img
                                                    src={sidebarProjects[0].thumbnail_url}
                                                    alt={sidebarProjects[0].title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-[#FDF5EE] dark:bg-[#162820]">
                                                    <Code2 className="h-16 w-16 text-[#E5E4E0] dark:text-[#2A4A3A]" />
                                                </div>
                                            )}

                                            {/* Status indicator */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${
                                                        sidebarProjects[0].status === 'live' ? 'bg-[#5AAF7E]' : 'bg-[#E8945A]'
                                                    }`}
                                                />
                                                <span className="rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                    {sidebarProjects[0].status_label}
                                                </span>
                                            </div>

                                            <div className="absolute right-4 bottom-4 left-4">
                                                <span className="mb-2 inline-block rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-semibold text-[#1A1A1A] backdrop-blur-sm">
                                                    {sidebarProjects[0].category_label}
                                                </span>
                                                <h3 className="font-display text-lg font-normal text-white drop-shadow-lg">
                                                    {sidebarProjects[0].title}
                                                </h3>
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-[#162820]">
                                                <ArrowUpRight className="h-4 w-4 text-[#1B3D2F] dark:text-[#5AAF7E]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </MotionDiv>
                        )}
                    </section>

                    {/* All Projects Section */}
                    <section id="all-projects" className="bg-white py-16 dark:bg-[#0F1A15]">
                        <div className="primary-container">
                            {/* Tab Navigation */}
                            <div className="mb-8">
                                <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                                    {(Object.entries(ownershipTypes) as [TabKey, string][]).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleTabChange(key)}
                                            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all ${
                                                activeTab === key
                                                    ? 'bg-[#1B3D2F] text-white dark:bg-[#5AAF7E] dark:text-[#0F1A15]'
                                                    : 'border border-[#E5E4E0] bg-white text-[#6B6B63] hover:border-[#2A5E44] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:bg-[#162820] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]'
                                            }`}
                                        >
                                            {label}
                                            <span
                                                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                                                    activeTab === key
                                                        ? 'bg-white/20 text-white dark:bg-[#0F1A15]/20 dark:text-[#0F1A15]'
                                                        : 'bg-[#F3F1EC] text-[#9E9E95] dark:bg-[#0F1A15] dark:text-[#9E9E95]'
                                                }`}
                                            >
                                                {key === 'deployments' ? deployments.length : (projects[key as keyof typeof projects]?.length ?? 0)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-[#9E9E95]">
                                    Browse through {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Filters - Pill Style */}
                            <div className="mb-10">
                                <ProjectFilters
                                    categories={categories}
                                    techStack={techStack}
                                    selectedCategory={selectedCategory}
                                    selectedTech={selectedTech}
                                    onCategoryChange={setSelectedCategory}
                                    onTechChange={setSelectedTech}
                                />
                            </div>

                            {/* Results Count */}
                            <div className="mb-6 text-sm text-[#9E9E95]">
                                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                            </div>

                            {/* Projects Grid - Magazine Style */}
                            {filteredProjects.length > 0 ? (
                                <MotionStagger key={activeTab} staggerDelay={0.05} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredProjects.map((project, index) => (
                                        <MotionItem key={project.id} variant="fadeUp">
                                            <ProjectCard
                                                project={project}
                                                onClick={() => handleProjectClick(project)}
                                                size={index === 0 && !selectedCategory && selectedTech.length === 0 ? 'large' : 'normal'}
                                            />
                                        </MotionItem>
                                    ))}
                                </MotionStagger>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F1EC] dark:bg-[#162820]">
                                        <Code2 className="h-8 w-8 text-[#9E9E95] dark:text-[#2A4A3A]" />
                                    </div>
                                    <p className="mb-4 text-lg text-[#6B6B63] dark:text-[#9E9E95]">No projects match your filters.</p>
                                    <button
                                        className="rounded-full border border-[#E5E4E0] px-5 py-2.5 text-sm font-medium text-[#6B6B63] transition-colors hover:border-[#1B3D2F] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:text-[#9E9E95] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setSelectedTech([]);
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="bg-[#FAFAF8] py-16 dark:bg-[#0A1210]">
                        <div className="primary-container">
                            <MotionStagger staggerDelay={0.1} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
                                <MotionItem
                                    variant="scaleUp"
                                    className="rounded-xl border border-[#E5E4E0] bg-white p-6 shadow-sm md:p-8 dark:border-[#2A4A3A] dark:bg-[#162820]"
                                >
                                    <div className="font-display mb-2 text-4xl font-light text-[#1A1A1A] md:text-5xl dark:text-[#E8E6E1]">
                                        {allProjects.length}
                                    </div>
                                    <div className="text-sm font-medium text-[#9E9E95]">Total Projects</div>
                                </MotionItem>
                                <MotionItem variant="scaleUp" className="rounded-xl bg-[#E4EDE8] p-6 md:p-8 dark:bg-[#162820]">
                                    <div className="font-display mb-2 text-4xl font-light text-[#1A1A1A] md:text-5xl dark:text-[#E8E6E1]">
                                        {allProjects.filter((p) => p.status === 'live').length}
                                    </div>
                                    <div className="text-sm font-medium text-[#1B3D2F] dark:text-[#5AAF7E]">Live Projects</div>
                                </MotionItem>
                                <MotionItem variant="scaleUp" className="rounded-xl bg-[#FDF5EE] p-6 md:p-8 dark:bg-[#162820]">
                                    <div className="font-display mb-2 text-4xl font-light text-[#1A1A1A] md:text-5xl dark:text-[#E8E6E1]">
                                        {allProjects.filter((p) => p.is_featured).length}
                                    </div>
                                    <div className="text-sm font-medium text-[#E8945A]">Featured</div>
                                </MotionItem>
                                <MotionItem variant="scaleUp" className="rounded-xl bg-[#F3F1EC] p-6 md:p-8 dark:bg-[#162820]">
                                    <div className="font-display mb-2 text-4xl font-light text-[#1A1A1A] md:text-5xl dark:text-[#E8E6E1]">
                                        {techStack.length}
                                    </div>
                                    <div className="text-sm font-medium text-[#6B6B63] dark:text-[#9E9E95]">Technologies</div>
                                </MotionItem>
                            </MotionStagger>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="border-t border-[#E5E4E0] bg-[#1B3D2F] py-16 dark:border-[#2A4A3A]">
                        <MotionDiv className="primary-container text-center">
                            <p className="mb-3 text-[0.75rem] font-semibold tracking-[0.15em] text-[#E8945A] uppercase">Let's collaborate</p>
                            <h2 className="font-display mb-4 text-2xl font-normal text-white md:text-3xl">Have a project in mind?</h2>
                            <p className="mx-auto mb-8 max-w-md text-[#B8D8C7]">I'm always open to discussing new projects and opportunities.</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="mailto:humfurie@gmail.com"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#E8945A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#d4833e]"
                                >
                                    Get in touch
                                </a>
                                <a
                                    href="https://github.com/Humfurie"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                                >
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </a>
                            </div>
                        </MotionDiv>
                    </section>
                </main>

                {/* Project Detail Modal */}
                <ProjectModal project={selectedProject} open={modalOpen} onClose={handleCloseModal} />
            </div>
        </>
    );
}
