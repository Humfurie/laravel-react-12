import { motion } from 'framer-motion';
import React from 'react';
import { useInView } from 'react-intersection-observer';

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
        { count: '2', label: 'years of experience' },
        { count: '100', label: 'cups of coffee' },
        { count: 'lol', label: 'can crack eggs but not jokes' },
        { imgUrl: '/images/about-me-item.webp' },
    ],
};

// Staggered parent
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.2,
        },
    },
};

// Child pop-in animation
const popIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: 'easeOut' as const },
    },
};

const HomeAboutMe: React.FC = () => {
    const { ref, inView } = useInView({ triggerOnce: true });

    return (
        <section className="about-me bg-brand-white py-[40px] md:py-[80px]">
            <div className="primary-container flex flex-col items-center gap-[32px] sm:flex-row lg:gap-[48px]">
                {/* Left side: Pop-in cards with stagger */}
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-[50%] md:gap-[28px]"
                >
                    {aboutData.items.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={popIn}
                            className="bg-muted-yellow flex max-h-[150px] min-h-[150px] max-w-full min-w-full flex-col items-center justify-center rounded-[28px] p-2 text-center md:max-h-[200px] md:min-h-[200px]"
                        >
                            {item.imgUrl ? (
                                <img src={item.imgUrl} alt="About item" className="h-full w-full object-contain" />
                            ) : (
                                <>
                                    <span className="text-brand-orange text-[40px] font-bold lg:text-[60px]">
                                        {item.count} <span className="text-muted-black">+</span>
                                    </span>
                                    <span className="text-muted-black">{item.label}</span>
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right side: Just static content */}
                <div className="excerpt w-full md:w-[50%]">
                    <h4 className="mb-4 w-full text-center font-bold sm:text-start">{aboutData.title}</h4>
                    <p className="mb-8 text-justify text-gray-600 md:text-[18px]">{aboutData.excerpt}</p>
                    <div className="flex w-full flex-col items-center justify-center sm:items-start">
                        {/*<ButtonOne*/}
                        {/*    type="button"*/}
                        {/*    text="Know More"*/}
                        {/*    className="btn-orange text-center max-w-fit"*/}
                        {/*/>*/}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeAboutMe;
