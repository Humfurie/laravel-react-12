import { BannerTextSection } from '@/components/home/sections/BannerTextSection';

export default function Main() {
    return (
        <section className="relative h-full min-h-screen w-full">
            <div className="primary-container flex flex-col items-start justify-center max-xl:px-[20px] md:justify-center">
                <BannerTextSection />
            </div>

            <div>
                {/* Mobile Image */}
                <img
                    src="/humps.png"
                    alt="Humphrey"
                    height={1000}
                    width={1000}
                    className="block h-full min-h-screen w-full min-w-full object-cover shadow-md md:hidden"
                />
                {/* Mobile Image */}

                <div className="hidden min-h-screen min-w-full md:flex">
                    <img
                        src="/humps.jpg"
                        alt="Humphrey"
                        height={1000}
                        width={1000}
                        className="hidden h-full min-h-screen w-full min-w-full object-cover shadow-md md:flex"
                    />
                </div>
            </div>
            <div className={`absolute top-0 h-full w-full bg-black/50 backdrop-blur-sm`}></div>
        </section>
    );
}
