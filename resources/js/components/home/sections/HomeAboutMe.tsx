import ButtonOne from "@/components/global/ButtonOne";
import { motion } from "framer-motion";
import React from "react";
import { useInView } from "react-intersection-observer";

interface AboutItems {
    count?: string;
    label?: string;
    imgUrl?: string;
}

interface AboutData {
    title: string;
    excerpt: string;
    items: AboutItems[];
}

const aboutData: AboutData = {
    title: "Hi! I'm Humphrey",
    excerpt:
        "I'm passionate about becoming a full-stack developer with a strong interest in server-side technologies. I'm enthusiastic about learning and always eager to expand my knowledge in this field. I believe in continuous improvement and enjoy tackling challenges to enhance my skills.",
    items: [
        { count: "2", label: "years of experience" },
        { count: "100", label: "cups of coffee" },
        { count: "3K", label: "lines of code" },
        { imgUrl: "/images/about-me-item.webp" }
    ]
};

const HomeAboutMe: React.FC = () => {

    const fadeInLeft = {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 0 },
    };

    const fadeInRight = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0 },
    };


    const { ref: leftRef, inView: leftInView } = useInView({ triggerOnce: false });
    const { ref: rightRef, inView: rightInView } = useInView({ triggerOnce: false });

    useInView({ triggerOnce: false, threshold: 0.3 })


    return (
        <section className="about-me py-[40px] md:py-[80px] bg-brand-white">
            <div className="primary-container flex flex-col items-center sm:flex-row gap-[32px] lg:gap-[48px]">

                <motion.div
                    ref={leftRef}
                    variants={fadeInLeft}
                    initial="hidden"
                    animate={leftInView ? "visible" : "hidden"}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-[50%] grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-[28px]">
                    {aboutData.items.map((item, index) => (
                        <div key={index} className="min-w-full max-w-full min-h-[150px] max-h-[150px] md:min-h-[200px] md:max-h-[200px] flex flex-col items-center justify-center p-2 bg-muted-yellow rounded-[28px] text-center">
                            {item.imgUrl ? (
                                <img
                                    src={item.imgUrl}
                                    alt="About item"
                                    className="object-contain w-full h-full"
                                />
                            ) : (
                                <>
                                    <span className="text-[40px] lg:text-[60px] font-bold text-brand-orange">
                                        {item.count} <span className="text-muted-black">+</span>
                                    </span>
                                    <span className="text-muted-black">{item.label}</span>
                                </>
                            )}
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    ref={rightRef}
                    variants={fadeInRight}
                    initial="hidden"
                    animate={rightInView ? "visible" : "hidden"}
                    transition={{ duration: 0.6 }}
                    className="excerpt w-full md:w-[50%]">
                    <h4 className="font-bold mb-4 w-full text-center sm:text-start">{aboutData.title}</h4>
                    <p className="md:text-[18px] text-gray-600 mb-8 text-justify">{aboutData.excerpt}</p>
                    <div className="w-full flex flex-col justify-center items-center sm:items-start">
                        <ButtonOne
                            type="button"
                            text="Know More"
                            className="btn-orange text-center max-w-fit"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HomeAboutMe;
