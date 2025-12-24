import { motion } from 'framer-motion';
import React from 'react';
import { useInView } from 'react-intersection-observer';

interface AboutItems {
    count?: string;
    label?: string;
    imgUrl?: string;
}

interface ProfileUser {
    name: string;
    headline: string | null;
    bio: string | null;
    about: string | null;
    profile_stats: { label: string; value: string }[];
}

interface HomeAboutMeProps {
    profileUser?: ProfileUser;
}

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

const HomeAboutMe: React.FC<HomeAboutMeProps> = ({ profileUser }) => {
    const { ref, inView } = useInView({ triggerOnce: true });

    // Default fallback data
    const defaultAboutData = {
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

    // Use profile data if available, otherwise use defaults
    const title = profileUser?.name ? `Hi! I'm ${profileUser.name.split(' ')[0]}` : defaultAboutData.title;
    const excerpt = profileUser?.about || defaultAboutData.excerpt;

    // Build items array from profile_stats or use defaults
    const items: AboutItems[] =
        profileUser?.profile_stats && profileUser.profile_stats.length > 0
            ? [
                  ...profileUser.profile_stats.map((stat) => ({
                      count: stat.value,
                      label: stat.label,
                  })),
                  { imgUrl: '/images/about-me-item.webp' }, // Always add the image at the end
              ]
            : defaultAboutData.items;

    return (
        <section className="about-me bg-brand-white py-[40px] md:py-[80px] dark:bg-gray-950">
            <div className="primary-container flex flex-col items-center gap-[24px] sm:flex-row sm:gap-[32px] lg:gap-[48px]">
                {/* Left side: Pop-in cards with stagger */}
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:w-[50%] md:gap-[28px]"
                >
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            variants={popIn}
                            className="bg-muted-yellow flex h-[120px] w-full flex-col items-center justify-center rounded-[20px] p-2 text-center sm:h-[150px] sm:rounded-[28px] md:h-[200px] dark:bg-orange-950/30"
                        >
                            {item.imgUrl ? (
                                <img src={item.imgUrl} alt="About item" className="h-full w-full object-contain" />
                            ) : (
                                <>
                                    <span className="text-brand-orange text-[28px] font-bold sm:text-[40px] lg:text-[60px]">
                                        {item.count} <span className="text-brand-gray">+</span>
                                    </span>
                                    <span className="text-brand-gray text-xs sm:text-sm md:text-base">{item.label}</span>
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right side: Just static content */}
                <div className="excerpt w-full md:w-[50%]">
                    <h4 className="mb-3 w-full text-center font-bold sm:mb-4 sm:text-start">{title}</h4>
                    <p className="mb-6 text-justify text-sm text-gray-600 sm:mb-8 sm:text-base md:text-[18px] dark:text-gray-300">{excerpt}</p>
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
