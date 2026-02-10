import Socials from '@/components/global/Socials';
import { MotionDiv } from '@/components/ui/motion';
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

            {/* Text Content */}
            <div className="primary-container absolute inset-0 z-20 flex h-full w-full flex-col items-center justify-center px-4 text-center">
                <MotionDiv delay={0.3}>
                    <h1
                        dangerouslySetInnerHTML={{ __html: bannerData.title }}
                        className="text-brand-white text-[40px] font-[700] tracking-[4px] sm:text-[60px] sm:tracking-[8px] md:text-[70px] md:tracking-[16px] lg:text-[80px] xl:text-[100px]"
                    />
                </MotionDiv>
                <MotionDiv delay={0.5} variant="fadeIn">
                    <p className="mt-2 text-[16px] text-white sm:text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px]">{bannerData.subTitle}</p>
                </MotionDiv>
                <MotionDiv delay={0.7} variant="fadeIn">
                    <Socials className="mb-[16px] py-[16px]" />
                </MotionDiv>
                <p className="mb-4 text-xs text-white sm:text-sm">TEMPORARY WEBSITE | SELF-HOSTED IN LOCAL SERVER</p>
                <MotionDiv delay={0.9} variant="fadeUp" className="align-center hs-bg-white absolute bottom-[40px] flex justify-center gap-6 sm:bottom-[70px]">
                    <a
                        href="/resume.pdf"
                        download="Humphrey_Resume.pdf"
                        className="hs-btn align-center flex items-center gap-2 text-center text-sm sm:text-base"
                    >
                        <TbDownload className="text-base sm:text-lg" />
                        Resume
                    </a>
                </MotionDiv>
            </div>
        </section>
    );
};

export default HomeBanner;
