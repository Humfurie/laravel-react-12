import Footer from '@/components/global/Footer';
import HomeAboutMe from '@/components/home/sections/HomeAboutMe';
import HomeBanner from '@/components/home/sections/HomeBanner';
import HomeCTA from '@/components/home/sections/HomeCTA';
import HomeExpertise from '@/components/home/sections/HomeExpertise';
import { JSX } from 'react';

export default function Home(): JSX.Element {
    // const { auth } = usePage<SharedData>().props;

    return (
        <>
            <HomeBanner />
            <HomeAboutMe />
            {/*<HomeProjects />*/}
            <HomeExpertise />
            <HomeCTA />
            <Footer />
        </>
    );
}
