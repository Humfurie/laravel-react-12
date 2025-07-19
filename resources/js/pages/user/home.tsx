import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeCTA from '@/components/home/sections/HomeCTA';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import HomeProjects from '@/components/home/sections/HomeProjects';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { JSX } from 'react';

interface HomeProps {
    banner: Record<string, unknown>;
    skills: Record<string, unknown>;
    experience: Record<string, unknown>;
    footer: Record<string, unknown>;
}

export default function Home({ banner, skills, experience, footer }: HomeProps): JSX.Element {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <HomeBanner />
            <HomeAboutMe />
            <HomeProjects />
            <HomeExpertise />
            <HomeCTA />
            <Footer />
        </>
    );
}
