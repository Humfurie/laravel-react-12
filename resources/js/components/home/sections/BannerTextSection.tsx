'use client';
import { AccountLinks } from '@/components/home/lib/AccountLinks';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const data = [
    'Open to work!',
    'Junior Software Developer. Laravel Developer. Video Editor',
    'Aspiring to become a fullstack developer',
    'Extremely interested in server setups',
    'Did you know that I hosted this website on my laptop?',
];
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
            <div className="absolute top-[30%] z-[2] sm:top-[35%]">
                <div className="flex flex-col space-y-8 max-sm:items-center max-sm:justify-center max-sm:text-center">
                    <h1 className="underline-5 text-[50px] font-bold text-white underline-offset-4 sm:max-w-[60%] sm:text-[75px] sm:leading-[80px] md:max-w-[65%] md:text-[100px] md:leading-[100px]">
                        <span className="text-orange-600">H</span>umphrey Singculan
                    </h1>
                    <motion.p
                        animate={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 1, duration: 0.5, ease: 'easeInOut' }}
                        className="max-w-[58%] text-[20px] text-white sm:max-w-[60%] sm:text-[30px] md:text-[35px]"
                    >
                        {currentItem}
                    </motion.p>
                    <div className={`group`}>
                        <a
                            href="https://drive.google.com/file/d/1N1zhYOnmAZhh0zEmafc6U6IV61QcAfb9/view"
                            className="btn group w-fit text-center text-white"
                        >
                            Resume
                        </a>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-[10%] left-1/2 z-10 -translate-x-1/2 transform text-white sm:right-[5%] sm:left-auto sm:flex sm:transform-none sm:items-center">
                <AccountLinks className="fill-white" />
            </div>
        </div>
    );
};
