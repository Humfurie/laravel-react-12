import React, { useMemo } from 'react';

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

// Default fallback data - defined once at module level
const DEFAULT_ABOUT_DATA = {
    title: "Hi! I'm Humphrey",
    excerpt:
        "I'm passionate about becoming a full-stack developer with a strong interest in server-side technologies. I'm enthusiastic about learning and always eager to expand my knowledge in this field. I believe in continuous improvement and enjoy tackling challenges to enhance my skills.",
    items: [
        { count: '2', label: 'years of experience' },
        { count: '100', label: 'cups of coffee' },
        { count: 'lol', label: 'can crack eggs but not jokes' },
        { imgUrl: '/images/about-me-item.webp' },
    ] as AboutItems[],
};

const HomeAboutMe: React.FC<HomeAboutMeProps> = ({ profileUser }) => {
    // Use profile data if available, otherwise use defaults
    const title = profileUser?.name ? `Hi! I'm ${profileUser.name.split(' ')[0]}` : DEFAULT_ABOUT_DATA.title;
    const excerpt = profileUser?.about || DEFAULT_ABOUT_DATA.excerpt;

    // Memoize items array to avoid recreation on every render
    const items = useMemo<AboutItems[]>(() => {
        if (profileUser?.profile_stats && profileUser.profile_stats.length > 0) {
            return [
                ...profileUser.profile_stats.map((stat) => ({
                    count: stat.value,
                    label: stat.label,
                })),
                { imgUrl: '/images/about-me-item.webp' },
            ];
        }
        return DEFAULT_ABOUT_DATA.items;
    }, [profileUser?.profile_stats]);

    return (
        <section className="about-me bg-brand-white py-[40px] md:py-[80px] dark:bg-gray-950">
            <div className="primary-container flex flex-col items-center gap-[24px] sm:flex-row sm:gap-[32px] lg:gap-[48px]">
                {/* Left side: Stats cards */}
                <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:w-[50%] md:gap-[28px]">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-muted-yellow flex h-[120px] w-full flex-col items-center justify-center rounded-[20px] p-2 text-center sm:h-[150px] sm:rounded-[28px] md:h-[200px] dark:bg-gray-800/80"
                        >
                            {item.imgUrl ? (
                                <img src={item.imgUrl} alt="About item" className="h-full w-full object-contain" loading="lazy" />
                            ) : (
                                <>
                                    <span className="text-[28px] font-bold text-orange-500 sm:text-[40px] lg:text-[60px] dark:text-orange-400">
                                        {item.count} <span className="text-gray-500 dark:text-gray-400">+</span>
                                    </span>
                                    <span className="text-xs text-gray-600 sm:text-sm md:text-base dark:text-gray-300">{item.label}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right side: Just static content */}
                <div className="excerpt w-full md:w-[50%]">
                    <h4 className="mb-3 w-full text-center font-bold text-gray-900 sm:mb-4 sm:text-start dark:text-white">{title}</h4>
                    <p className="mb-6 text-justify text-sm text-gray-600 sm:mb-8 sm:text-base md:text-[18px] dark:text-gray-300">{excerpt}</p>
                </div>
            </div>
        </section>
    );
};

export default HomeAboutMe;
