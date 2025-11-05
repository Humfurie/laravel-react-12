import SectionTitle from '@/components/global/SectionTitle';
import { motion } from 'framer-motion';

type Experience = {
    id: number;
    company: string;
    image_url: string | null;
    location: string;
    description: string[];
    position: string;
    start_month: number; // 0-11 (0 = January)
    start_year: number; // e.g., 2023
    end_month: number | null; // null for current positions
    end_year: number | null; // null for current positions
    is_current_position: boolean;
};

type ExperienceSectionProps = {
    experiences?: Experience[];
};

/**
 * Fallback data for experiences.
 *
 * IMPORTANT: This data is primarily loaded from the database via Laravel Inertia props.
 * The fallback exists only as a safety mechanism if:
 * - The database is empty
 * - Props aren't passed correctly from the backend
 * - There's an error fetching data
 *
 * To update experiences, use the admin panel at /admin/experiences
 * The seeder (database/seeders/ExperienceSeeder.php) contains the same data.
 */
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
        start_month: 6,
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
        start_month: 6,
        start_year: 2023,
        end_month: 0,
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
        start_month: 3,
        start_year: 2023,
        end_month: 6,
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
        start_month: 8,
        start_year: 2022,
        end_month: 1,
        end_year: 2023,
        is_current_position: false,
    },
];

export function formatMonthYear(month: number, year: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return `${months[month]} ${year}`;
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
        eMonth = now.getMonth();
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

/**
 * ExperienceSection Component
 *
 * Displays professional work experience in a timeline format.
 *
 * Data Source: Database (App\Models\Experience)
 * - Experience data is loaded from the database via Laravel Inertia props
 * - Props are passed from routes/web.php home route
 * - CRUD operations available at /admin/experiences
 *
 * The component receives experiences from the database, but has fallback data
 * for safety if the database is empty or props aren't passed.
 */
export const ExperienceSection = ({ experiences = fallbackExperiences }: ExperienceSectionProps) => {
    return (
        <section id="experience" className="relative overflow-hidden bg-white py-20">
            <SectionTitle title={'Experience'} />

            <div className="primary-container">
                <div className="text-brand-gray mb-12 w-full text-center">My professional journey in the tech industry.</div>

                <div className="relative mx-auto mt-12 mb-12 w-full lg:mt-[80px]">
                    {/* Vertical line */}
                    <div className="bg-brand-orange absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 transform lg:block" />

                    {experiences.map((experience, index) => (
                        <motion.div
                            key={`timeline-${experience.id}`}
                            initial={{ opacity: 0, x: index % 2 === 0 ? 100 : -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className={`hs-shadow relative mb-8 w-full cursor-pointer rounded-xl p-4 transition-all duration-300 sm:p-6 lg:mb-12 ${
                                index % 2 === 0 ? 'lg:mr-8 lg:ml-auto' : 'lg:mr-auto lg:ml-8'
                            } mx-auto lg:mx-0 lg:w-5/12`}
                        >
                            <div className="mb-4 flex items-center">
                                <div className="mr-3 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 sm:mr-4 sm:h-16 sm:w-16">
                                    <img
                                        src={experience.image_url || '/default-company.png'}
                                        alt={experience.company}
                                        className="h-full w-full object-cover"
                                        width={64}
                                        height={64}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-brand-orange mb-1 text-lg leading-tight font-semibold sm:text-xl md:text-[28px]">
                                        {experience.position}
                                    </p>
                                    <p className="text-brand-gray text-xs sm:text-sm">{experience.company}</p>
                                </div>
                            </div>
                            <p className="text-brand-gray mb-3 flex items-center text-xs sm:text-sm">{experience.location}</p>

                            <div className="text-brand-gray mb-4 flex flex-col gap-1 rounded-lg bg-gray-50 p-2 text-xs sm:flex-row sm:justify-between sm:p-3 sm:text-sm">
                                <span className="mb-1 sm:mb-0">
                                    {formatMonthYear(experience.start_month, experience.start_year)} -{' '}
                                    {experience.is_current_position ? 'Present' : formatMonthYear(experience.end_month!, experience.end_year!)}
                                </span>
                                <span className="text-brand-orange">
                                    {calculateDuration(
                                        experience.start_month,
                                        experience.start_year,
                                        experience.end_month,
                                        experience.end_year,
                                        experience.is_current_position,
                                    )}
                                </span>
                            </div>

                            <div className="text-brand-gray text-sm sm:text-base">
                                <ul className="space-y-2">
                                    {experience.description.map((point, i) => (
                                        <li key={i} className="flex items-start leading-relaxed">
                                            <span className="bg-brand-orange mt-2 mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full sm:mr-3 sm:h-2 sm:w-2" />
                                            <span className="flex-1">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Timeline dot */}
                            <div
                                className={`bg-brand-orange absolute top-[13%] hidden h-6 w-6 rounded-full border-4 border-white transition-all duration-300 lg:block ${
                                    index % 2 === 0 ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
                                } `}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
