"use client"
import {AccountLinks} from "@/components/home/lib/AccountLinks";
import {useEffect, useState} from "react";
import {motion} from "framer-motion";

const data = [
    "Open to work!",
    "Junior Software Developer. Laravel Developer. Video Editor",
    "Aspiring to become a fullstack developer",
    "Extremely interested in server setups",
    "Did you know that I hosted this website on my laptop?"
]
export const BannerTextSection = () => {
    const [currentItem, setCurrentItem] = useState(data[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * data.length);
            setCurrentItem(data[randomIndex]);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <div className="absolute z-[2] top-[30%] sm:top-[35%]">
                <div className="flex flex-col space-y-8 max-sm:justify-center max-sm:items-center max-sm:text-center">
                    <h1 className="underline-offset-4 underline-5 text-white text-[50px] sm:text-[75px] md:text-[100px] font-bold sm:max-w-[60%] md:max-w-[65%] sm:leading-[80px] md:leading-[100px]">
                        <span className="text-orange-600">H</span>umphrey Singculan
                    </h1>
                    <motion.p
                        animate={{opacity: 1}}
                        initial={{opacity: 0}}
                        exit={{opacity: 0}}
                        transition={{delay: 1, duration: 0.5, ease: "easeInOut"}}
                        className="text-white text-[20px] sm:text-[30px] md:text-[35px] max-w-[58%] sm:max-w-[60%]">
                        {currentItem}
                    </motion.p>
                    <div className={`group`}>
                        <a href="https://drive.google.com/file/d/1N1zhYOnmAZhh0zEmafc6U6IV61QcAfb9/view" className="btn group text-white text-center w-fit">Resume</a>
                    </div>

                </div>
            </div>

            <div
                className="absolute text-white bottom-[10%] left-1/2 transform -translate-x-1/2 z-10 sm:right-[5%] sm:left-auto sm:transform-none sm:flex sm:items-center">
                <AccountLinks className="fill-white"/>
            </div>
        </div>
    )
}
