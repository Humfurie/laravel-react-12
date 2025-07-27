import Socials from '@/components/global/Socials';
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
        <section className="home-banner relative min-h-screen bg-gradient-to-t from-green-300 to-white">
            {/* Responsive Banner Image */}
            <picture>
                <source srcSet={bannerData.imgSrc} media="(min-width: 768px)" />
                <img
                    src={bannerData.mobileImgSrc}
                    alt="Humphrey Banner"
                    onLoad={() => setLoaded(true)}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                    style={{ opacity: loaded ? 1 : 0 }}
                />
            </picture>

            <div className="bg-muted-black/70 absolute inset-0 z-10 backdrop-blur-[1.5px]" />

            {/* Text Content */}
            <div className="primary-container absolute inset-0 z-20 flex h-full w-full flex-col items-center justify-center text-center">
                <h1
                    dangerouslySetInnerHTML={{ __html: bannerData.title }}
                    className="text-brand-white text-[50px] font-[700] sm:text-[60px] md:text-[70px] md:tracking-[16px] lg:text-[80px] xl:text-[100px]"
                />
                <p className="text-[20px] text-white sm:text-[24px] md:text-[28px] lg:text-[32px]">{bannerData.subTitle}</p>
                <Socials className="mb-[16px] py-[16px]" />
                TEMPORARY WEBSITE | SELF-HOSTED IN LOCAL SERVER
                <div className="align-center hs-bg-white absolute bottom-[70px] flex justify-center gap-6">
                    {/*<ButtonOne text="Projects" type="button" className="btn-orange" icon={<RiArrowRightDoubleLine className="text-[20px]" />} />*/}

                    <a href="resume.pdf" download="Humphrey_Resume.pdf" className="hs-btn align-center flex items-center gap-2 text-center">
                        <TbDownload />
                        Resume
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;
