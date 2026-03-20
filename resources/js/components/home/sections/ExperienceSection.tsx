import SectionTitle from '@/components/global/SectionTitle';
import { MotionItem, MotionStagger } from '@/components/ui/motion';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';

type Experience = {
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
};

type ExperienceSectionProps = {
    experiences?: Experience[];
};

const fallbackExperiences: Experience[] = [
    {
        id: 1,
        company: 'Cody Web Development Inc',
        image_url: '/storage/experiences/cody.png',
        location: 'Cebu City, Philippines',
        description: [
            'Converting legacy PHP applications using Ethna and Smarty templates to modern Laravel 11.',
            'Refactoring outdated logic into modern Laravel features such as route model binding, invokable controllers, and service-based architecture.',
            'Collaborating with team to ensure smooth transition and accurate system behavior replication.',
        ],
        position: 'Software Engineer',
        start_month: 7,
        start_year: 2024,
        end_month: null,
        end_year: null,
        is_current_position: true,
    },
    {
        id: 2,
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image_url: '/storage/experiences/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: [
            'Worked on Laravel maintenance projects, upgrading outdated syntax and optimizing inefficient code.',
            'Assisted in integrating Laravel Filament for backend admin dashboards.',
            'Participated in debugging and feature improvements for legacy and active projects.',
            'Collaborated with various teams to troubleshoot and resolve issues.',
        ],
        position: 'Junior Laravel Developer | Junior Software Developer',
        start_month: 7,
        start_year: 2023,
        end_month: 1,
        end_year: 2024,
        is_current_position: false,
    },
    {
        id: 3,
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image_url: '/storage/experiences/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: [
            'Acquiring experience and familiarity with best development practices.',
            'Trained in Laravel, PHP and Filament.',
            'Introduced to Domain-Driven Design principles.',
            'Skills gained from training include PHP, Laravel, Filament, and JQuery.',
        ],
        position: 'Junior Laravel Trainee',
        start_month: 4,
        start_year: 2023,
        end_month: 7,
        end_year: 2023,
        is_current_position: false,
    },
    {
        id: 4,
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image_url: '/storage/experiences/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: [
            "I've been introduced to technologies such as React, NodeJS, JavaScript, Tailwind, as well as various frameworks and tools like Git, among others.",
            "I have experience working with the AdonisJS Framework and Next.js, and I've completed several minor projects using them.",
            "I've developed APIs and successfully completed our capstone project, which is an Automated Attendance System utilizing RFID Technology.",
        ],
        position: 'Intern',
        start_month: 9,
        start_year: 2022,
        end_month: 2,
        end_year: 2023,
        is_current_position: false,
    },
];

// Month names constant - defined once at module level to avoid recreation
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatMonthYear(month: number, year: number): string {
    return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function calculateDuration(
    startMonth: number,
    startYear: number,
    endMonth: number | null = null,
    endYear: number | null = null,
    isCurrentPosition: boolean = false,
): string {
    let eMonth = endMonth;
    let eYear = endYear;

    if (isCurrentPosition || (endMonth === null && endYear === null)) {
        const now = new Date();
        eMonth = now.getMonth() + 1;
        eYear = now.getFullYear();
    } else if (endMonth === null || endYear === null) {
        return 'Invalid date range';
    }

    const totalMonths = (eYear! - startYear) * 12 + (eMonth! - startMonth);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years > 0 && months > 0) {
        return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    } else if (years > 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
        return `${months} month${months !== 1 ? 's' : ''}`;
    }
}

/** Format a year range like "2024 — Present" or "2023 — 2024" */
function formatYearRange(exp: Experience): string {
    const start = exp.start_year;
    const end = exp.is_current_position ? 'Present' : exp.end_year;
    return `${start} — ${end}`;
}

/** Format the month range like "Jun 2024 — Present" */
function formatMonthRange(exp: Experience): string {
    const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const start = `${SHORT_MONTHS[exp.start_month - 1]} ${exp.start_year}`;
    const end = exp.is_current_position ? 'Present' : `${SHORT_MONTHS[exp.end_month! - 1]} ${exp.end_year}`;
    return `${start} — ${end}`;
}

// Individual experience row - clean list item layout matching prototype
const ExperienceItem = memo(function ExperienceItem({ experience }: { experience: Experience }) {
    return (
        <MotionItem
            variant="fadeUp"
            className="grid grid-cols-1 gap-2 border-b border-[#E5E4E0] py-9 transition-all duration-300 hover:pl-3 md:grid-cols-[160px_1fr] md:gap-10 dark:border-[#2A4A3A]"
        >
            {/* Date column */}
            <div className="pt-0.5 text-[0.82rem] leading-snug text-[#9E9E95] md:pt-1">
                <span className="font-display text-[1.3rem] font-normal text-[#1A1A1A] md:block dark:text-[#E8E6E1]">
                    {formatYearRange(experience)}
                </span>
                <span className="ml-2 md:ml-0">{formatMonthRange(experience)}</span>
            </div>

            {/* Info column */}
            <div>
                <p className="font-display text-[28px] font-light text-[#1B3D2F] sm:text-[32px] md:text-[38px] dark:text-[#E8E6E1]">
                    {experience.position}
                </p>
                <div className="mt-1 text-[0.92rem] font-medium text-[#E8945A]">{experience.company}</div>
                <div className="mt-1.5 text-[0.82rem] text-[#9E9E95]">{experience.location}</div>
                {experience.description.length > 0 && (
                    <p className="mt-3 max-w-[560px] text-[0.9rem] leading-[1.7] text-[#6B6B63] dark:text-[#9E9E95]">{experience.description[0]}</p>
                )}
            </div>
        </MotionItem>
    );
});

export const ExperienceSection = ({ experiences = fallbackExperiences }: ExperienceSectionProps) => {
    return (
        <section className="bg-[#F3F1EC] py-[clamp(80px,12vw,160px)] dark:bg-[#0F1A15]">
            <div className="primary-container">
                {/* Header row: title left, resume link right */}
                <div className="mb-[clamp(48px,6vw,80px)] flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
                    <SectionTitle title="Experience" heading="Where I've worked" />
                    <Link
                        href="/resume"
                        className="inline-flex shrink-0 items-center gap-2 text-[0.85rem] font-medium text-[#1B3D2F] transition-colors hover:text-[#E8945A] dark:text-[#5AAF7E] dark:hover:text-[#E8945A]"
                    >
                        View full resume
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Experience list */}
                <MotionStagger staggerDelay={0.1} className="flex flex-col">
                    {/* Top border on first item */}
                    <div className="border-t border-[#E5E4E0] dark:border-[#2A4A3A]" />
                    {experiences.map((experience) => (
                        <ExperienceItem key={`exp-${experience.id}`} experience={experience} />
                    ))}
                </MotionStagger>
            </div>
        </section>
    );
};
