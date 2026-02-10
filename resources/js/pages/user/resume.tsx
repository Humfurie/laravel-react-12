import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { MotionDiv } from '@/components/ui/motion';
import type { SocialLinks } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Briefcase,
    ChevronDown,
    ChevronUp,
    Code2,
    Download,
    GraduationCap,
    Mail,
    Printer,
    User as UserIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Experience {
    id: number;
    company: string;
    image_url: string | null;
    location: string;
    description: string[];
    position: string;
    start_month: number;
    start_year: number;
    end_month: number | null;
    end_year: number | null;
    is_current_position: boolean;
}

interface Expertise {
    id: number;
    name: string;
    image: string | null;
    image_url: string | null;
    category_slug: 'be' | 'fe' | 'td';
    order: number;
    is_active: boolean;
}

interface Education {
    degree: string;
    institution: string;
    location?: string;
    start_year: number;
    end_year?: number;
    description?: string;
    honors?: string;
}

interface ProfileUser {
    name: string;
    headline: string | null;
    bio: string | null;
    about: string | null;
    email: string;
    social_links: SocialLinks | null;
    resume_path: string | null;
    education: Education[];
    profile_stats: { label: string; value: string }[];
    github_username: string | null;
}

interface Props {
    experiences: Experience[];
    expertises: Expertise[];
    profileUser: ProfileUser;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(month: number, year: number): string {
    return `${months[month]} ${year}`;
}

function getDuration(startMonth: number, startYear: number, endMonth: number | null, endYear: number | null): string {
    const end = endMonth !== null && endYear !== null ? new Date(endYear, endMonth) : new Date();
    const start = new Date(startYear, startMonth);
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    if (years > 0 && remainingMonths > 0) return `${years}y ${remainingMonths}m`;
    if (years > 0) return `${years}y`;
    return `${remainingMonths}m`;
}

const sections = [
    { id: 'summary', label: 'Summary', icon: UserIcon },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'contact', label: 'Contact', icon: Mail },
];

function ResumeExperienceItem({ experience, expanded, onToggle }: { experience: Experience; expanded: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-gray-100 py-4 last:border-0 dark:border-gray-700/50">
            <button onClick={onToggle} className="flex w-full items-start justify-between text-left">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{experience.position}</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{experience.company}</p>
                        </div>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span>{experience.location}</span>
                        <span>|</span>
                        <span>
                            {formatDate(experience.start_month, experience.start_year)} –{' '}
                            {experience.is_current_position
                                ? 'Present'
                                : formatDate(experience.end_month!, experience.end_year!)}
                        </span>
                        <span className="text-orange-500">
                            {getDuration(experience.start_month, experience.start_year, experience.end_month, experience.end_year)}
                        </span>
                    </div>
                </div>
                <span className="mt-1 shrink-0 text-gray-400">
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            </button>

            {expanded && experience.description.length > 0 && (
                <ul className="mt-3 space-y-1.5 pl-4">
                    {experience.description.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                            {item}
                        </li>
                    ))}
                </ul>
            )}

            {/* Always show in print */}
            {!expanded && experience.description.length > 0 && (
                <ul className="mt-3 hidden space-y-1.5 pl-4 print:block">
                    {experience.description.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function SkillBadge({ skill }: { skill: Expertise }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {skill.image_url && <img src={skill.image_url} alt={skill.name} className="h-3.5 w-3.5 object-contain" />}
            {skill.name}
        </span>
    );
}

export default function Resume({ experiences, expertises, profileUser }: Props) {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([experiences[0]?.id]));
    const [activeSection, setActiveSection] = useState('summary');
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const toggleExpand = useCallback((id: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Group expertise by category
    const skillsByCategory = useMemo(() => {
        const grouped = { be: [] as Expertise[], fe: [] as Expertise[], td: [] as Expertise[] };
        expertises.forEach((e) => {
            if (grouped[e.category_slug]) {
                grouped[e.category_slug].push(e);
            }
        });
        return grouped;
    }, [expertises]);

    const categoryLabels: Record<string, string> = { be: 'Backend', fe: 'Frontend', td: 'Tools & DevOps' };

    // IntersectionObserver for TOC highlight
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px', threshold: 0 },
        );

        sections.forEach(({ id }) => {
            const el = sectionRefs.current[id];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Head title={`Resume - ${profileUser.name}`}>
                <meta name="description" content={`${profileUser.name} - ${profileUser.headline}. View my professional experience, skills, and education.`} />
            </Head>

            <FloatingNav currentPage="resume" />

            <main className="min-h-screen bg-gray-50 pt-20 print:bg-white print:pt-0 dark:bg-gray-900">
                <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
                    {/* Action buttons */}
                    <MotionDiv className="mb-6 flex justify-end gap-3 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        {profileUser.resume_path && (
                            <a
                                href={profileUser.resume_path}
                                download
                                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                            >
                                <Download className="h-4 w-4" />
                                Download PDF
                            </a>
                        )}
                    </MotionDiv>

                    {/* Resume Document */}
                    <MotionDiv
                        delay={0.1}
                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-10 print:rounded-none print:border-none print:p-0 print:shadow-none dark:border-gray-700 dark:bg-gray-800"
                    >
                        {/* Header */}
                        <header className="border-b border-gray-200 pb-6 dark:border-gray-700">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profileUser.name}</h1>
                            {profileUser.headline && (
                                <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">{profileUser.headline}</p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <a href={`mailto:${profileUser.email}`} className="transition-colors hover:text-orange-500">
                                    {profileUser.email}
                                </a>
                                {profileUser.social_links?.linkedin && (
                                    <a
                                        href={profileUser.social_links.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors hover:text-orange-500"
                                    >
                                        LinkedIn
                                    </a>
                                )}
                                {profileUser.social_links?.github && (
                                    <a
                                        href={profileUser.social_links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors hover:text-orange-500"
                                    >
                                        GitHub
                                    </a>
                                )}
                                {profileUser.github_username && !profileUser.social_links?.github && (
                                    <a
                                        href={`https://github.com/${profileUser.github_username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors hover:text-orange-500"
                                    >
                                        GitHub
                                    </a>
                                )}
                            </div>
                        </header>

                        {/* Content with TOC sidebar */}
                        <div className="mt-8 flex gap-10">
                            {/* Sticky TOC sidebar (desktop, hidden in print) */}
                            <nav className="hidden w-40 shrink-0 lg:block print:hidden">
                                <div className="sticky top-24">
                                    <ul className="space-y-1">
                                        {sections.map(({ id, label, icon: Icon }) => (
                                            <li key={id}>
                                                <a
                                                    href={`#${id}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }}
                                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                                        activeSection === id
                                                            ? 'bg-orange-50 font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400'
                                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </nav>

                            {/* Content */}
                            <div className="min-w-0 flex-1 space-y-10">
                                {/* Professional Summary */}
                                <section id="summary" ref={(el) => { sectionRefs.current['summary'] = el; }}>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <UserIcon className="h-5 w-5 text-orange-500" />
                                        Professional Summary
                                    </h2>
                                    <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                                        {profileUser.bio || profileUser.about || 'No summary available.'}
                                    </p>
                                </section>

                                {/* Experience */}
                                <section id="experience" ref={(el) => { sectionRefs.current['experience'] = el; }}>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <Briefcase className="h-5 w-5 text-orange-500" />
                                        Experience
                                    </h2>
                                    <div>
                                        {experiences.map((exp) => (
                                            <ResumeExperienceItem
                                                key={exp.id}
                                                experience={exp}
                                                expanded={expandedIds.has(exp.id)}
                                                onToggle={() => toggleExpand(exp.id)}
                                            />
                                        ))}
                                    </div>
                                </section>

                                {/* Technical Skills */}
                                <section id="skills" ref={(el) => { sectionRefs.current['skills'] = el; }}>
                                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <Code2 className="h-5 w-5 text-orange-500" />
                                        Technical Skills
                                    </h2>
                                    <div className="space-y-4">
                                        {(['be', 'fe', 'td'] as const).map(
                                            (cat) =>
                                                skillsByCategory[cat].length > 0 && (
                                                    <div key={cat}>
                                                        <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {categoryLabels[cat]}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {skillsByCategory[cat].map((skill) => (
                                                                <SkillBadge key={skill.id} skill={skill} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ),
                                        )}
                                    </div>
                                </section>

                                {/* Education */}
                                <section id="education" ref={(el) => { sectionRefs.current['education'] = el; }}>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <GraduationCap className="h-5 w-5 text-orange-500" />
                                        Education & Certifications
                                    </h2>
                                    {profileUser.education && profileUser.education.length > 0 ? (
                                        <div className="space-y-4">
                                            {profileUser.education.map((edu, idx) => (
                                                <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-700/50">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{edu.degree}</div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                                        {edu.location && <span>{edu.location}</span>}
                                                        {edu.location && <span>|</span>}
                                                        <span>
                                                            {edu.start_year}
                                                            {edu.end_year ? ` – ${edu.end_year}` : ' – Present'}
                                                        </span>
                                                        {edu.honors && (
                                                            <>
                                                                <span>|</span>
                                                                <span className="text-orange-500">{edu.honors}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {edu.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{edu.description}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Education details will be added soon.
                                        </p>
                                    )}
                                </section>

                                {/* Contact */}
                                <section id="contact" ref={(el) => { sectionRefs.current['contact'] = el; }}>
                                    <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                        <Mail className="h-5 w-5 text-orange-500" />
                                        Contact
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        <a
                                            href={`mailto:${profileUser.email}`}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-orange-300 hover:text-orange-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
                                        >
                                            <Mail className="h-4 w-4" />
                                            {profileUser.email}
                                        </a>
                                        {profileUser.social_links?.linkedin && (
                                            <a
                                                href={profileUser.social_links.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500/50 dark:hover:text-blue-400"
                                            >
                                                LinkedIn
                                            </a>
                                        )}
                                        {(profileUser.social_links?.github || profileUser.github_username) && (
                                            <a
                                                href={profileUser.social_links?.github || `https://github.com/${profileUser.github_username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
                                            >
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </MotionDiv>
                </div>
            </main>

            <Footer />
        </>
    );
}
