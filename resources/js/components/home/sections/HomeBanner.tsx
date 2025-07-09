import { useScreenSize } from "@/lib/useScreenSize";

const bannerData = {
    title: "<span>H</span>UMFURIE", // fixed typo
    subTitle: "Software Developer", // fixed typo
    mobileImgSrc: "/images/humphrey-banner-mb.webp",
    imgSrc: "/images/humphrey-banner.webp"
};

const HomeBanner = () => {
    const { isMobile } = useScreenSize();

    const backgroundImage = `url(${isMobile ? bannerData.mobileImgSrc : bannerData.imgSrc})`;

    return (
        <section
            className='home-banner min-h-screen relative'
            style={{
                backgroundImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className='primary-container w-full h-full flex flex-col justify-center align-center'>
                <div className=' '>
                    <h1 dangerouslySetInnerHTML={{ __html: bannerData.title }} className='text-brand-white font-[700]' />
                    <p>{bannerData.subTitle}</p>
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;
