import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeCTA from '@/components/home/sections/HomeCTA';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import HomeProjects from '@/components/home/sections/HomeProjects';
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
            <HomeExpertise />
            <HomeCTA />
            {/* <Main /> */}
            {/* <SkillSection /> */}
            {/* <ExperienceSection /> */}
            <Footer />
        </>
    )
}
