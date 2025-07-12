import MyCard from "@/components/global/MyCard";
import SectionTitle from "@/components/global/SectionTitle";
import { RiArrowRightDoubleLine } from "react-icons/ri";

interface ProjectsData {
    imgUrl: string;
    title: string;
    excerpt: string;

}

const projectsData: ProjectsData[] = [
    {
        imgUrl: "/images/projects/sample-project1.webp",
        title: "Automated Identification System using RFID Technology",
        excerpt: "Sample Project 1 Sample Project 1 Sample Project 1 Sample Project 1 Sample Project 1",
    },
    {
        imgUrl: "/images/projects/sample-project1.webp",
        title: "Sample Project 2",
        excerpt: "Sample Project 2 Sample Project 2 Sample Project 2 Sample Project 2 Sample Project 2",
    },
    {
        imgUrl: "/images/projects/sample-project1.webp",
        title: "Sample Project 3",
        excerpt: "Sample Project 3 Sample Project 3 Sample Project 3 Sample Project 3 Sample Project ",
    }
]

const HomeProjects = () => {
    return (
        <section className="home-projects py-[40px] md:py-[80px]">
            <div className="primary-container">
                <SectionTitle
                    title="From the Projects"
                    icon={<RiArrowRightDoubleLine />}
                    link="/projects"
                />

                <div className="flex justify-center items-center max-lg:flex-wrap lg:flex-row gap-6 md:gap-[32px]">
                    {projectsData.map((project, index) => (
                        <MyCard
                            key={index}
                            imgUrl={project.imgUrl}
                            title={project.title}
                            excerpt={project.excerpt}
                        />
                    ))}

                </div>
            </div>
        </section>
    )
}

export default HomeProjects
