import { motion } from 'framer-motion';
import { useState } from 'react';

type Experience = {
    company: string;
    image: string;
    location: string;
    description: string[];
    position: string;
    startMonth: number;  // 0-11 (0 = January)
    startYear: number;   // e.g., 2023
    endMonth: number | null;  // null for current positions
    endYear: number | null;   // null for current positions
    isCurrentPosition: false

};


const experiences: Experience[] = [
    {
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image: '/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: ['I\'ve been introduced to technologies such as React, NodeJS, JavaScript, Tailwind, as well as various frameworks and tools like Git, among others.',
            'I have experience working with the AdonisJS Framework and Next.js, and I\'ve completed several minor projects using them.',
            'I\'ve developed APIs and successfully completed our capstone project, which is an Automated Attendance System utilizing RFID Technology.'],
        position: 'Intern',
        startMonth: 8,
        startYear: 2022,
        endMonth: 1,
        endYear: 2023,
        isCurrentPosition: false

    },
    {
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image: '/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: ['Acquiring experience and familiarity with best development practices.',
            'Trained in Laravel, PHP and Filament.',
            'Introduced to Domain-Driven Design principles.',
            'Skills gained from training include PHP, Laravel, Filament, and JQuery.'],
        position: 'Junior Laravel Trainee',
        startMonth: 3,
        startYear: 2023,
        endMonth: 6,
        endYear: 2023,
        isCurrentPosition: false
    },
    {
        company: 'Halcyon Digital Media Design | Halcyon Agile',
        image: '/halcyon.png',
        location: 'Cordova, Cebu, Philippines',
        description: ['I\'ve effectively built a service management feature within a SaaS platform.',
            'Ensured code readability by implementing best practices during development.',
            'Contributed to feature creation within ongoing maintenance projects.',
            'Collaborated with various teams to troubleshoot and resolve issues.'],
        position: 'Junior Laravel Developer | Junior Software Developer',
        startMonth: 6,
        startYear: 2023,
        endMonth: 0,
        endYear: 2024,
        isCurrentPosition: false

    }
];

export function formatMonthYear(month: number, year: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `${months[month]} ${year}`;
}

/**
 * Calculate duration between two month-year pairs
 */
export function calculateDuration(
    startMonth: number,
    startYear: number,
    endMonth: number | null = null,
    endYear: number | null = null,
    isCurrentPosition: boolean = false
): string {
    // If current position, use current date
    let eMonth = endMonth;
    let eYear = endYear;

    if (isCurrentPosition || (endMonth === null && endYear === null)) {
        const now = new Date();
        eMonth = now.getMonth();
        eYear = now.getFullYear();
    } else if (endMonth === null || endYear === null) {
        return 'Invalid date range';
    }

    // Calculate total months
    const totalMonths = (eYear! - startYear) * 12 + (eMonth! - startMonth);

    // Format the output
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
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section id="experience" className="py-20 bg-gray-900 relative">

            {/* Top gradient - custom CSS with explicit values */}
            <div
                className="absolute top-0 left-0 right-0 h-[4.4rem] pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255) 0%, rgba(17, 24, 39, 1) 100%)'
                }}
            ></div>


            <div className="container mx-auto px-4 py-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Experience</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                        My professional journey in the tech industry.
                    </p>

                    {/* Dots navigation */}
                    <div className="flex justify-center gap-3 mb-8">
                        {experiences.map((_, index) => (
                            <button
                                key={`dot-${index}`}
                                onClick={() => setActiveIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    activeIndex === index ? 'bg-orange-600 scale-125' : 'bg-gray-400'
                                }`}
                                aria-label={`View experience ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Timeline visualization - Responsive version */}
                <div className="relative max-w-4xl mx-auto mb-12">
                    {/* Vertical line - Only visible on md screens and up */}
                    <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gray-700 transform -translate-x-1/2" />

                    {experiences.map((experience, index) => (
                        <motion.div
                            key={`timeline-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: activeIndex === index ? 1 : 0.3,
                                y: 0,
                                scale: activeIndex === index ? 1 : 0.95
                            }}
                            transition={{ duration: 0.5 }}
                            className={`relative mb-12 p-6 rounded-lg
                                ${index % 2 === 0
                                ? 'md:ml-auto md:mr-8'
                                : 'md:mr-auto md:ml-8'}
                                w-full
                                md:w-5/12
                                mx-auto md:mx-0
                                bg-gray-800 border border-gray-700`}
                            onClick={() => setActiveIndex(index)}
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 mr-3 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                                    <img src={experience.image} alt={experience.company}
                                         className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{experience.position}</h3>
                                    <p className="text-primary-orange">{experience.company}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-400 mb-4">
                                <span className="mb-1 sm:mb-0">
                                    {formatMonthYear(experience.startMonth, experience.startYear)} - {
                                    experience.isCurrentPosition
                                        ? 'Present'
                                        : formatMonthYear(experience.endMonth!, experience.endYear!)
                                }
                                </span>
                                <span>
                                    {calculateDuration(
                                        experience.startMonth,
                                        experience.startYear,
                                        experience.endMonth,
                                        experience.endYear,
                                        experience.isCurrentPosition
                                    )}
                                </span>
                            </div>

                            <div className="text-gray-300">
                                <p className="text-sm italic mb-3">{experience.location}</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    {experience.description.map((point, i) => (
                                        <li key={i}>{point}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Timeline dot - Only visible on md screens and up */}
                            <div
                                className={`hidden md:block absolute top-6 w-4 h-4 rounded-full bg-primary-orange border-4 border-gray-900 ${
                                    index % 2 === 0 ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'
                                } transform`} />

                            {/* Mobile timeline dot - Only visible on small screens */}
                            <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-orange border-4 border-gray-900" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom gradient - custom CSS with explicit values */}
            <div
                className="absolute bottom-0 left-0 right-0 h-[4.4rem] pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, rgba(255, 255, 255) 0%, rgba(17, 24, 39, 1) 100%)'
                }}
            ></div>

        </section>
    );
};
