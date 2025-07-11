import ButtonOne from "@/components/global/ButtonOne";
import Socials from "@/components/global/Socials";
import { useState } from "react";
import { RiArrowRightDoubleLine } from "react-icons/ri";
import { TbDownload } from "react-icons/tb";

const bannerData = {
    title: "<span>H</span>UMFURIE",
    subTitle: "Software Developer",
    mobileImgSrc: "/images/humphrey-banner-mb.webp",
    imgSrc: "/images/humphrey-banner.webp"
};

const HomeBanner = () => {
    const [loaded, setLoaded] = useState(false);

    return (
        <section className="home-banner min-h-screen relative bg-gradient-to-t from-green-600 to-white">
            {/* Loading Overlay */}
            {!loaded && (
                <div className="absolute inset-0 bg-gradient-to-t from-green-400 to-white animate-pulse z-10" />
            )}

            {/* Responsive Banner Image */}
            <picture>
                <source srcSet={bannerData.imgSrc} media="(min-width: 768px)" />
                <img
                    src={bannerData.mobileImgSrc}
                    alt="Humphrey Banner"
                    onLoad={() => setLoaded(true)}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                    style={{ opacity: loaded ? 1 : 0 }}
                />
            </picture>

            {/* Optional: Additional Gradient Overlay on Top of the Image */}
            <div className="absolute inset-0 bg-muted-black/70 z-10 backdrop-blur-[1.5px]" />

            {/* Text Content */}
            <div className="primary-container absolute inset-0 z-20 w-full h-full flex flex-col justify-center items-center text-center">
                <h1 dangerouslySetInnerHTML={{ __html: bannerData.title }} className="text-brand-white font-[700] text-[50px] sm:text-[60px] md:text-[70px] lg:text-[80px]" />
                <p className="text-white text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px]">{bannerData.subTitle}</p>
                <Socials className="py-[16px] mb-[16px]"/>

                <div className="absolute bottom-[70px] flex justify-center align-center gap-6 hs-bg-white">
                    <ButtonOne
                        text='Projects'
                        type='button'
                        className="btn-orange"
                        icon={<RiArrowRightDoubleLine className="text-[20px]" />}

                    />

                    <ButtonOne
                        text='Resume'
                        type='button'
                        className="btn-white"
                        icon={<TbDownload />}
                    />
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;
