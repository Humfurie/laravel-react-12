import { motion } from 'framer-motion';
import SectionTitle from '@/components/global/SectionTitle';

type Experience = {
    company: string;
    image: string;
    location: string;
    description: string[];
    position: string;
    startMonth: number; // 0-11 (0 = January)
    startYear: number; // e.g., 2023
    endMonth: number | null; // null for current positions
    endYear: number | null; // null for current positions
    isCurrentPosition: boolean;
};

const experiences: Experience[] = [
    {
        company: 'Cody Web Development Inc',
        image: '/cody.png',
        location: 'Cebu City, Philippines',
        description: [
            'Converting legacy PHP applications using Ethna and Smarty templates to modern Laravel 11.',
            'Refactoring outdated logic into modern Laravel features such as route model\n' +
                ' binding, invokable controllers, and service-based architecture.',
            'Collaborating with team to ensure smooth transition and accurate system\n' + ' behavior replication.',
        ],
        position: 'Software Engineer',
        startMonth: 6,
        startYear: 2024,
        endMonth: 0,
        endYear: 0,
        isCurrentPosition: true,
    },

    {
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image: '/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: [
            ' Worked on Laravel maintenance projects, upgrading outdated syntax and\n' + ' optimizing inefficient code.',
            'Assisted in integrating Laravel Filament for backend admin dashboards.',
            'Participated in debugging and feature improvements for legacy and active\n' + ' projects.',
            'Collaborated with various teams to troubleshoot and resolve issues.',
        ],
        position: 'Junior Laravel Developer | Junior Software Developer',
        startMonth: 6,
        startYear: 2023,
        endMonth: 0,
        endYear: 2024,
        isCurrentPosition: false,
    },
    {
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image: '/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: [
            'Acquiring experience and familiarity with best development practices.',
            'Trained in Laravel, PHP and Filament.',
            'Introduced to Domain-Driven Design principles.',
            'Skills gained from training include PHP, Laravel, Filament, and JQuery.',
        ],
        position: 'Junior Laravel Trainee',
        startMonth: 3,
        startYear: 2023,
        endMonth: 6,
        endYear: 2023,
        isCurrentPosition: false,
    },
    {
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image: '/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: [
            "I've been introduced to technologies such as React, NodeJS, JavaScript, Tailwind, as well as various frameworks and tools like Git, among others.",
            "I have experience working with the AdonisJS Framework and Next.js, and I've completed several minor projects using them.",
            "I've developed APIs and successfully completed our capstone project, which is an Automated Attendance System utilizing RFID Technology.",
        ],
        position: 'Intern',
        startMonth: 8,
        startYear: 2022,
        endMonth: 1,
        endYear: 2023,
        isCurrentPosition: false,
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

export const ExperienceSection = () => {
    return (
        <section id="experience" className="relative overflow-hidden bg-white py-20">
            <SectionTitle title={'Experience'} />

            <div className="primary-container">
                <div className="text-muted-black mb-12 w-full text-center">My professional journey in the tech industry.</div>

                <div className="relative mx-auto mt-12 mb-12 w-full lg:mt-[80px]">
                    {/* Vertical line */}
                    <div className="bg-brand-orange absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 transform lg:block" />

                    {experiences.map((experience, index) => (
                        <motion.div
                            key={`timeline-${index}`}
                            initial={{ opacity: 0, x: index % 2 === 0 ? 100 : -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className={`hs-shadow relative mb-12 w-full cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                                index % 2 === 0 ? 'lg:mr-8 lg:ml-auto' : 'lg:mr-auto lg:ml-8'
                            } mx-auto lg:mx-0 lg:w-5/12`}
                        >
                            <div className="mb-4 flex items-center">
                                <div className="mr-4 h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                                    <img src={experience.image} alt={experience.company} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-brand-orange mb-1 text-[28px] leading-tight font-semibold">{experience.position}</p>
                                    <p className="text-muted-black max-md:text-sm">{experience.company}</p>
                                </div>
                            </div>
                            <p className="text-muted-black mb-3 flex items-center">{experience.location}</p>

                            <div className="text-muted-black mb-4 flex flex-col rounded-lg bg-gray-50 p-3 max-md:text-sm sm:flex-row sm:justify-between">
                                <span className="mb-1 sm:mb-0">
                                    {formatMonthYear(experience.startMonth, experience.startYear)} -{' '}
                                    {experience.isCurrentPosition ? 'Present' : formatMonthYear(experience.endMonth!, experience.endYear!)}
                                </span>
                                <span className="text-brand-orange">
                                    {calculateDuration(
                                        experience.startMonth,
                                        experience.startYear,
                                        experience.endMonth,
                                        experience.endYear,
                                        experience.isCurrentPosition,
                                    )}
                                </span>
                            </div>

                            <div className="text-muted-black">
                                <ul className="space-y-2">
                                    {experience.description.map((point, i) => (
                                        <li key={i} className="flex items-start leading-relaxed">
                                            <span className="bg-brand-orange mt-2 mr-3 h-2 w-2 flex-shrink-0 rounded-full" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Timeline dot */}
                            <div
                                className={`bg-brand-orange absolute top-[13%] hidden h-6 w-6 rounded-full border-4 border-white transition-all duration-300 md:block ${
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
