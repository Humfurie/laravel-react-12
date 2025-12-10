import AppLogo from '@/components/app-logo';
import Footer from '@/components/global/Footer';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { publicNavItems } from '@/config/navigation';
import type { Project, ProjectCategory } from '@/types/project';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, Code2, Github, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
    featured: Project[];
    projects: Project[];
    categories: Record<ProjectCategory, string>;
    techStack: string[];
}

export default function ProjectsShowcase({ featured, projects, categories, techStack }: Props) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTech, setSelectedTech] = useState<string[]>([]);

    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            if (selectedCategory && project.category !== selectedCategory) {
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
    }, [projects, selectedCategory, selectedTech]);

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProject(null);
    };

    // Get first featured project for hero
    const heroProject = featured[0];
    const sidebarProjects = featured.slice(1, 3);

    return (
        <>
            <Head title="Projects">
                <meta name="description" content="Explore my portfolio of projects - web applications, mobile apps, APIs, libraries, and more." />
            </Head>

            <div className="min-h-screen bg-[#FAFAF8]">
                {/* Magazine-style Navbar */}
                <nav className="sticky top-0 z-50 border-b border-gray-100 bg-[#FAFAF8]/95 backdrop-blur-md">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogo />
                        </Link>

                        {/* Pill Navigation */}
                        <div className="hidden items-center gap-1 rounded-full border border-gray-100 bg-white px-2 py-1.5 shadow-sm md:flex">
                            {publicNavItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.id === 'projects';
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.route}
                                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                            isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {item.showIcon && <Icon className="h-4 w-4" />}
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile menu */}
                        <div className="flex items-center gap-2 md:hidden">
                            {publicNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.id} href={item.route} className="p-2 text-gray-600 hover:text-gray-900">
                                        <Icon className="h-5 w-5" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <main>
                    {/* Magazine Hero Section */}
                    <section className="container mx-auto px-4 py-8 md:py-12">
                        {/* Section Header */}
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
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
                                                className="text-gray-300"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                            <Link
                                href="#all-projects"
                                className="hidden items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 md:flex"
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
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#E8E4DC]">
                                        {heroProject.thumbnail_url ? (
                                            <img
                                                src={heroProject.thumbnail_url}
                                                alt={heroProject.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Code2 className="h-24 w-24 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        {heroProject.started_at && (
                                            <div className="absolute top-6 left-6 rounded-full bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm">
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
                                    <div className="flex flex-col justify-between rounded-3xl bg-[#C5E8D5] p-6">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-600">
                                            <Sparkles className="h-4 w-4" />
                                            <span>FEATURED</span>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm text-gray-600">Explore my</p>
                                            <h3 className="mb-4 text-2xl font-bold text-gray-900">
                                                Web & Mobile
                                                <br />
                                                Projects
                                            </h3>
                                            <p className="text-sm text-gray-600">Building innovative solutions with modern technologies</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="mt-6 rounded-full border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
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
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-[#F5E6D3]">
                                                    <Code2 className="h-16 w-16 text-gray-400" />
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
                    <section id="all-projects" className="bg-white py-16">
                        <div className="container mx-auto px-4">
                            {/* Section Header */}
                            <div className="mb-8">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="h-px flex-1 bg-gray-200" />
                                    <h2 className="font-serif text-3xl font-bold text-gray-900">All Projects</h2>
                                    <div className="h-px flex-1 bg-gray-200" />
                                </div>
                                <p className="text-center text-gray-500">
                                    Browse through {projects.length} project{projects.length !== 1 ? 's' : ''} in my portfolio
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
                            <div className="mb-6 text-sm text-gray-500">
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
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                        <Code2 className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="mb-4 text-lg text-gray-600">No projects match your filters.</p>
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
                    <section className="bg-[#FAFAF8] py-16">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
                                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">{projects.length}</div>
                                    <div className="text-sm font-medium text-gray-500">Total Projects</div>
                                </div>
                                <div className="rounded-3xl bg-[#C5E8D5] p-6 md:p-8">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                                        {projects.filter((p) => p.status === 'live').length}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">Live Projects</div>
                                </div>
                                <div className="rounded-3xl bg-[#F5E6D3] p-6 md:p-8">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
                                        {projects.filter((p) => p.is_featured).length}
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">Featured</div>
                                </div>
                                <div className="rounded-3xl bg-[#E8E4DC] p-6 md:p-8">
                                    <div className="mb-2 font-serif text-4xl font-bold text-gray-900 md:text-5xl">{techStack.length}</div>
                                    <div className="text-sm font-medium text-gray-700">Technologies</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-gray-900 py-16">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">Let's build something amazing</h2>
                            <p className="mx-auto mb-8 max-w-md text-gray-400">Interested in working together? Let's discuss your next project.</p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button className="rounded-full bg-white px-8 text-gray-900 hover:bg-gray-100">Get in touch</Button>
                                <Button variant="outline" className="rounded-full border-white px-8 text-white hover:bg-white/10">
                                    <Github className="mr-2 h-4 w-4" />
                                    GitHub
                                </Button>
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
