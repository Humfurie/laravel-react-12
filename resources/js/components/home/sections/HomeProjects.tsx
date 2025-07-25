import MyCard from "@/components/global/MyCard";
import SectionTitle from "@/components/global/SectionTitle";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";


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
];

// Animation Variants
const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const // ✅ Type assertion to fix error
        }
    }
};


const HomeProjects = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        threshold: 0.2,
        triggerOnce: true
    });

    useEffect(() => {
        if (inView) {
            controls.start("show");
        } else {
            controls.start("hidden");
        }
    }, [inView, controls]);

    return (
        <section className="home-projects py-[40px] md:py-[80px]">
            <div className="primary-container">
                <SectionTitle
                    title="From the Projects"
                    link="/projects"
                />

                <motion.div
                    ref={ref}
                    className="flex justify-center items-center max-lg:flex-wrap lg:flex-row gap-6 md:gap-[32px]"
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                >
                    {projectsData.map((project, index) => (
                        <motion.div key={index} variants={cardVariants}>
                            <MyCard
                                imgUrl={project.imgUrl}
                                title={project.title}
                                excerpt={project.excerpt}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};


export default HomeProjects;
