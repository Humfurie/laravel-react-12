import {motion} from "framer-motion";
import {svgs} from "@/components/svgs";
import {JSX} from "react";
export const SkillSection = () => {

    return (
        <section className="h-fullw-full">
            <div
                className={`primary-container max-xl:px-[20px] py-[40px] md:py-[80px]`}>
                <div className={`flex flex-col h-full w-full`}>
                    <h2 className="pb-[30px] text-center sm:text-left text-[30px] text-primary-black font-bold md:text-[45px]">
                        <span className="text-primary-orange">K</span>nowledgeable in
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[35px]">
                        {svgs.map((skill:{name: string, icon: JSX.Element}, id: number) => {
                            return (
                                <motion.div key={id}
                                            initial={{opacity: 0, y: 0.3}}
                                            transition={{ duration: 0.1}}
                                            whileInView={{opacity: 1, y:0, transition:{delay: 0.1 * id}}}
                                            viewport={{once:true}}
                                            className="shadow-lg rounded-xl flex justify-center items-center min-h-[180px] p-[30px]"
                                >
                                    <div className="flex flex-col justify-between items-center gap-y-[20px] h-full w-full">
                                        {skill.icon}
                                     <span className="text-[14px] text-gray-500">{skill.name}</span>
                                    </div>

                                </motion.div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </section>
    )
}
