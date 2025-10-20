'use client';
import { motion, useScroll } from 'framer-motion';
import { useRef } from 'react';

interface Experience {
    start: string;
    end: string;
    company: string;
    position: string;
    description: string[];
    image: string;
}

export const StaggerMotionCard = ({ experience }: { experience: Experience }) => {
    const container = useRef(null);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['0 1', '1.33 1'],
    });

    return (
        <>
            <div ref={container} className="my-20 grid w-full grid-rows-1 gap-4 bg-gray-950">
                <motion.h2
                    style={{
                        scale: scrollYProgress,
                        opacity: scrollYProgress,
                    }}
                    className="primary-container text-xl font-bold text-white"
                >
                    {experience.start} - {experience.end}
                </motion.h2>
                <motion.div
                    style={{
                        scale: scrollYProgress,
                        opacity: scrollYProgress,
                    }}
                    className="primary-container relative flex max-h-screen flex-col rounded-xl bg-white p-4"
                >
                    <h2 className="text-xl font-bold text-black">{experience.company}</h2>
                    <h2 className="text-xl font-bold text-black">{experience.position}</h2>
                    <div className="lg:grid lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <ul className="text-gray-700">
                                {experience.description.map((exp, index) => {
                                    return <li key={index}>{exp}</li>;
                                })}
                            </ul>
                            <span className="mt-2 inline-block"></span>
                        </div>
                        <div className="flex items-center justify-center lg:col-span-1">
                            <img src={experience.image} alt="Halcyon Digital" height={100} width={100} className="" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};
