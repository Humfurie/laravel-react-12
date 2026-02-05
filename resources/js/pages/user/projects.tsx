import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectModal } from '@/components/projects/ProjectModal';
import StructuredData, { schemas } from '@/components/seo/StructuredData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

            <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900">
                <FloatingNav currentPage="projects" />

                <main className="pt-20">
                    {/* Magazine Hero Section */}
                    <section className="container mx-auto px-4 py-8 md:py-12">
                        {/* Section Header */}
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white">
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
                                                className="text-gray-300 dark:text-gray-600"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                            <Link
                                href="#all-projects"
                                className="hidden items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 md:flex dark:text-gray-400 dark:hover:text-white"
                            >
                                See all projects
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Featured Grid - Magazine Layout */}
                        {heroProject && (
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Main Featured Card */}
                                <div className="group cursor-pointer lg:col-span-2" onClick={() => handleProjectClick(heroProject)}>
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#E8E4DC] dark:bg-gray-800">
                                        {heroProject.thumbnail_url ? (
                                            <img
                                                src={heroProject.thumbnail_url}
                                                alt={heroProject.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Code2 className="h-24 w-24 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        {heroProject.started_at && (
                                            <div className="absolute top-6 left-6 rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200">
                                                {new Date(heroProject.started_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        <div className="absolute top-6 right-6">
                                            <Badge className="rounded-full border-0 bg-[#88C0A8] px-4 py-1.5 text-white">
                                                {heroProject.category_label}
                                            </Badge>
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                                            <h2 className="mb-2 text-2xl font-bold text-white md:text-3xl">{heroProject.title}</h2>
                                            <p className="line-clamp-2 max-w-xl text-sm text-white/80 md:text-base">
                                                {heroProject.short_description}
                                            </p>
                                        </div>

                                        {/* Arrow Link */}
                                        <div className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110">
                                            <ArrowUpRight className="h-5 w-5 text-gray-900" />
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Cards */}
                                <div className="flex flex-col gap-6">
                                    {/* Info Card */}
                                    <div className="flex flex-col justify-between rounded-3xl bg-[#C5E8D5] p-6 dark:bg-green-900/30">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                            <Sparkles className="h-4 w-4" />
                                            <span>FEATURED</span>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Explore my</p>
                                            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                                Web & Mobile
                                                <br />
                                                Projects
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Building innovative solutions with modern technologies
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="mt-6 rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-200 dark:hover:text-gray-900"
                                            onClick={() => document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth' })}
                                        >
                                            Learn more
                                        </Button>
                                    </div>

                                    {/* Second Featured */}
                                    {sidebarProjects[0] && (
                                        <div
                                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl"
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
                                                <div className="flex h-full items-center justify-center bg-[#F5E6D3] dark:bg-gray-700">
                                                    <Code2 className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            )}

                                            {/* Status indicator */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${
                                                        sidebarProjects[0].status === 'live' ? 'bg-green-500' : 'bg-yellow-500'
                                                    }`}
                                                />
                                                <span className="rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                                                    {sidebarProjects[0].status_label}
                                                </span>
                                            </div>

                                            <div className="absolute right-4 bottom-4 left-4">
                                                <Badge className="mb-2 rounded-full border-0 bg-white/90 text-gray-900">
                                                    {sidebarProjects[0].category_label}
                                                </Badge>
                                                <h3 className="text-lg font-bold text-white drop-shadow-lg">{sidebarProjects[0].title}</h3>
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100">
                                                <ArrowUpRight className="h-4 w-4 text-gray-900" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* All Projects Section */}
                    <section id="all-projects" className="bg-white py-16 dark:bg-gray-800">
                        <div className="container mx-auto px-4">
                            {/* Tab Navigation */}
                            <div className="mb-8">
                                <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                                    {(Object.entries(ownershipTypes) as [TabKey, string][]).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleTabChange(key)}
                                            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                                                activeTab === key
                                                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {label}
                                            <span
                                                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                                                    activeTab === key
                                                        ? 'bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900'
                                                        : 'bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {key === 'deployments' ? deployments.length : (projects[key as keyof typeof projects]?.length ?? 0)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-center text-gray-500 dark:text-gray-400">
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
                            <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                            </div>

                            {/* Projects Grid - Magazine Style */}
                            {filteredProjects.length > 0 ? (
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredProjects.map((project, index) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onClick={() => handleProjectClick(project)}
                                            size={index === 0 && !selectedCategory && selectedTech.length === 0 ? 'large' : 'normal'}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Code2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">No projects match your filters.</p>
                                    <Button
                                        variant="outline"
                                        className="rounded-full"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setSelectedTech([]);
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Stats Section - Magazine Style */}
                    <section className="bg-[#FAFAF8] py-16 dark:bg-gray-900">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
                                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 dark:border-gray-700 dark:bg-gray-800">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
                                        {allProjects.length}
                                    </div>
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</div>
                                </div>
                                <div className="rounded-3xl bg-[#C5E8D5] p-6 md:p-8 dark:bg-green-900/30">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
                                        {allProjects.filter((p) => p.status === 'live').length}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Projects</div>
                                </div>
                                <div className="rounded-3xl bg-[#F5E6D3] p-6 md:p-8 dark:bg-amber-900/30">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
                                        {allProjects.filter((p) => p.is_featured).length}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured</div>
                                </div>
                                <div className="rounded-3xl bg-[#E8E4DC] p-6 md:p-8 dark:bg-gray-700">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
                                        {techStack.length}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Technologies</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="border-t border-gray-100 bg-white py-16 dark:border-gray-800 dark:bg-gray-950">
                        <div className="container mx-auto px-4 text-center">
                            <p className="mb-3 text-sm font-medium tracking-wide text-orange-600 uppercase dark:text-orange-400">
                                Let's collaborate
                            </p>
                            <h2 className="mb-4 text-2xl font-semibold text-gray-900 md:text-3xl dark:text-white">
                                Have a project in mind?
                            </h2>
                            <p className="mx-auto mb-8 max-w-md text-gray-600 dark:text-gray-400">
                                I'm always open to discussing new projects and opportunities.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="mailto:humfurie@gmail.com"
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                                >
                                    Get in touch
                                </a>
                                <a
                                    href="https://github.com/Humfurie"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </a>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Project Detail Modal */}
                <ProjectModal project={selectedProject} open={modalOpen} onClose={handleCloseModal} />

                <Footer />
            </div>
        </>
    );
}
