import Socials from '@/components/global/Socials';
import GoalWidget from '@/components/home/sections/GoalWidget';
import { useState } from 'react';
import { TbDownload } from 'react-icons/tb';

const bannerData = {
    title: '<span>H</span>UMPHREY',
    subTitle: 'Software Developer',
    mobileImgSrc: '/images/humphrey-banner-mb.webp',
    imgSrc: '/images/humphrey-banner.webp',
};

const HomeBanner = () => {
    const [loaded, setLoaded] = useState(false);

    return (
        <section className="home-banner from-brand-green to-brand-offwhite relative min-h-screen bg-gradient-to-t">
            {/* Responsive Banner Image */}
            <picture>
                <source srcSet={bannerData.imgSrc} media="(min-width: 768px)" />
                <img
                    src={bannerData.mobileImgSrc}
                    alt="Humphrey Banner"
                    width="1920"
                    height="1080"
                    onLoad={() => setLoaded(true)}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                    style={{ opacity: loaded ? 1 : 0 }}
                    fetchPriority="high"
                />
            </picture>

            <div className="bg-brand-black/60 absolute inset-0 z-10 backdrop-blur-[1.5px]" />

            {/* Text Content - Horizontal Layout on Desktop */}
            <div className="primary-container absolute inset-0 z-20 flex h-full w-full items-center justify-center px-4">
                <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-8 md:flex-row md:gap-12 lg:gap-16">
                    {/* Left side: Name and Details */}
                    <div className="flex flex-col items-center text-center">
                        <h1
                            dangerouslySetInnerHTML={{ __html: bannerData.title }}
                            className="text-brand-white text-[40px] font-[700] tracking-[4px] sm:text-[60px] sm:tracking-[8px] md:text-[70px] md:tracking-[16px] lg:text-[80px] xl:text-[100px]"
                        />
                        <p className="mt-2 text-[16px] text-white sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px]">
                            {bannerData.subTitle}
                        </p>
                        <Socials className="mb-[16px] py-[16px]" />
                        <p className="mb-4 text-xs text-white sm:text-sm">TEMPORARY WEBSITE | SELF-HOSTED IN LOCAL SERVER</p>

                        {/* Mobile Todo Widget - Below name */}
                        <div className="mt-6 w-full max-w-sm md:hidden">
                            <GoalWidget />
                        </div>

                        <div className="align-center hs-bg-white bottom-[40px] mt-6 flex justify-center gap-6 sm:bottom-[70px] md:absolute md:mt-0">
                            <a
                                href="/resume.pdf"
                                download="Humphrey_Resume.pdf"
                                className="hs-btn align-center flex items-center gap-2 text-center text-sm sm:text-base"
                            >
                                <TbDownload className="text-base sm:text-lg" />
                                Resume
                            </a>
                        </div>
                    </div>

                    {/* Right side: Todo Widget on Desktop */}
                    <div className="hidden w-80 flex-shrink-0 md:block lg:w-96">
                        <GoalWidget />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;
