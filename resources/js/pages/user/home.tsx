import Footer from '@/components/global/footer';
import { ExperienceSection } from "@/components/home/sections/ExperienceSection";
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeProjects from '@/components/home/sections/HomeProjects';
import { SkillSection } from "@/components/home/sections/SkillSection";
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface HomeProps {
    banner: {},
    skills: {},
    experience: {},
    footer: {},
}

export default function Home({ banner, skills, experience, footer }: HomeProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            {/* <Header auth={auth} /> */}
            <HomeBanner />
            <HomeAboutMe />
            <HomeProjects />
            {/* <Main /> */}
            <SkillSection />
            <ExperienceSection />
            <Footer />
        </>
    )
}
