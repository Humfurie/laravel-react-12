import SectionTitle from '@/components/global/SectionTitle';
import { MotionDiv } from '@/components/ui/motion';
import React, { useMemo } from 'react';

interface ProfileUser {
    name: string;
    headline: string | null;
    bio: string | null;
    about: string | null;
    profile_stats: { label: string; value: string }[];
    about_image_path: string | null;
}

interface HomeAboutMeProps {
    profileUser?: ProfileUser;
}

const DEFAULT_STATS = [
    { value: '3+', label: 'Years' },
    { value: '15+', label: 'Projects' },
    { value: '9', label: 'Live Sites' },
    { value: '500+', label: 'Commits' },
];

const DEFAULT_BIO =
    "I'm passionate about building elegant, performant web applications with modern technologies. With a strong focus on Laravel and React, I create full-stack solutions that solve real problems and deliver exceptional user experiences.";

const HomeAboutMe: React.FC<HomeAboutMeProps> = ({ profileUser }) => {
    const bio = profileUser?.about || DEFAULT_BIO;

    const stats = useMemo(() => {
        if (profileUser?.profile_stats && profileUser.profile_stats.length > 0) {
            return profileUser.profile_stats.map((s) => ({ value: s.value, label: s.label }));
        }
        return DEFAULT_STATS;
    }, [profileUser?.profile_stats]);

    return (
        <section className="py-[clamp(80px,12vw,160px)]">
            <div className="primary-container grid items-center gap-12 md:grid-cols-2 md:gap-16">
                {/* Left: Text content */}
                <MotionDiv>
                    <SectionTitle title="About" heading="A developer who cares about the craft" />
                    <p className="mt-4 text-base leading-relaxed text-[#6B6B63] dark:text-[#9E9E95]">{bio}</p>
                </MotionDiv>

                {/* Right: Stats grid — bordered 2×2 container */}
                <MotionDiv delay={0.3} className="overflow-hidden rounded-xl border border-[#E5E4E0] bg-[#E5E4E0] dark:border-[#2A4A3A] dark:bg-[#2A4A3A]">
                    <div className="grid grid-cols-2 gap-px">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center justify-center bg-white p-7 text-center transition-colors duration-300 hover:bg-[#FDF5EE] dark:bg-[#162820] dark:hover:bg-[#1E3A2D]"
                            >
                                <span className="font-display text-[2rem] font-medium text-[#1B3D2F] dark:text-[#5AAF7E]">
                                    {stat.value}
                                </span>
                                <span className="mt-1 text-[0.82rem] text-[#6B6B63] dark:text-[#9E9E95]">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
};

export default HomeAboutMe;
