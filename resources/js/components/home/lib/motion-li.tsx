import {motion} from "framer-motion";
import React from "react";
import { Link } from '@inertiajs/react';

interface MotionLiProps {
    link: {
        id: number,
        url: string,
        title: string,
        disabled: boolean
    }
}

export const MotionLi: React.FC<MotionLiProps> = ({link}) => {
    return (
        <>
            {!link.disabled ? (
                <motion.li
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.9}}
                    key={link.id}
                >
                    <Link href={link.url} className="block text-white py-2 px-3 rounded md:p-0" aria-current="page">
                        <span>{link.title}</span>
                    </Link>
                </motion.li>
            ) : (
                <div className="block text-gray-400 py-2 px-3 rounded md:p-0">
                    (<span>{link.title}</span>)
                </div>
            )}
        </>
    )
}
