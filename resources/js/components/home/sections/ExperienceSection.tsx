import {StaggerMotionCard} from "@/components/home/lib/StaggerMotionCard";

const experiences = [
    {
        company: "Halcyon Digital Media Design | Halcyon Agile",
        image: "/halcyon.png",
        location: "Cordova, Cebu, Philippines",
        description: ["I've been introduced to technologies such as React, NodeJS, JavaScript, Tailwind, as well as various frameworks and tools like Git, among others.",
            "I have experience working with the AdonisJS Framework and Next.js, and I've completed several minor projects using them.",
            "I've developed APIs and successfully completed our capstone project, which is an Automated Attendance System utilizing RFID Technology."],
        position: "Intern",
        start: "September 2022",
        end: "February 2023",
        duration: "6 months"
    },
    {
        company: "Halcyon Digital Media Design | Halcyon Agile",
        image: "/halcyon.png",
        location: "Cordova, Cebu, Philippines",
        description: ["Acquiring experience and familiarity with best development practices.",
            "Trained in Laravel, PHP and Filament.",
            "Introduced to Domain-Driven Design principles.",
            "Skills gained from training include PHP, Laravel, Filament, and JQuery."],
        position: "Junior Laravel Trainee",
        start: "April 2023",
        end: "July 2023",
        duration: "6 months"
    },
    {
        company: "Halcyon Digital Media Design | Halcyon Agile",
        image: "/halcyon.png",
        location: "Cordova, Cebu, Philippines",
        description: ["I've effectively built a service management feature within a SaaS platform.",
            "Ensured code readability by implementing best practices during development.",
            "Contributed to feature creation within ongoing maintenance projects.",
            "Collaborated with various teams to troubleshoot and resolve issues."],
        position: "Junior Laravel Developer | Junior Software Developer",
        start: "July 2023",
        end: "January 2024",
        duration: "6 months"
    },
]
export const ExperienceSection = () => {

    return (
        <section className="relative bg-gray-950">
            <div className="flex justify-center items-center h-screen w-full bg-gradient-to-b from-white to-gray-950">
                <h2 className="pb-[30px] text-center sm:text-left text-[30px] text-primary-black font-bold md:text-[45px]">
                <span className="text-primary-orange">E</span>xperience
            </h2></div>
            <div className="text-white h-full w-full p-4">
                {experiences.map((experience: any, index: number) => {
                        return (
                            <div key={index} >
                                <StaggerMotionCard index={index} experience={experience}/>
                            </div>
                        )
                    }
                )}
            </div>
            <div className="h-screen w-full bg-gradient-to-b from-gray-950 to-white"></div>
        </section>
    )
}