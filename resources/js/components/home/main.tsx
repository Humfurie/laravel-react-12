import {BannerTextSection} from "@/components/home/sections/BannerTextSection";

export default function Main() {
    return (
        <section className="relative h-full w-full min-h-screen">
            <div className="primary-container max-xl:px-[20px] flex flex-col justify-center items-start md:justify-center">
                <BannerTextSection/>
            </div>

            <div>
                {/* Mobile Image */}
                <img
                    src="/humps.png"
                    alt="Humphrey"
                    height={1000}
                    width={1000}
                    className="block w-full h-full object-cover min-h-screen min-w-full shadow-md md:hidden"
                />
                {/* Mobile Image */}

                <div className="min-h-screen min-w-full hidden md:flex">
                    <img
                        src="/humps.jpg"
                        alt="Humphrey"
                        height={1000}
                        width={1000}
                        className="w-full h-full object-cover min-h-screen min-w-full shadow-md hidden md:flex"
                    />
                </div>
            </div>
            <div className={`absolute top-0 w-full h-full bg-black/50 backdrop-blur-sm`}></div>
        </section>

    )
}
