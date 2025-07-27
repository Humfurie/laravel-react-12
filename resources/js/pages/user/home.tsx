import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeExpertise from '@/components/home/sections/HomeExpertise';

import { JSX } from 'react';
import { ExperienceSection } from '@/components/home/sections/ExperienceSection';

export default function Home(): JSX.Element {
    return (
        <>
            <HomeBanner />
            <HomeAboutMe />
            {/*<HomeProjects />*/}
            <HomeExpertise />
            <ExperienceSection />
            {/*<HomeCTA />*/}
            <Footer />
        </>
    );
}
