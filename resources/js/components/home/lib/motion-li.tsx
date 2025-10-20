import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';

interface MotionLiProps {
    link: {
        id: number;
        url: string;
        title: string;
        disabled: boolean;
    };
}

export const MotionLi: React.FC<MotionLiProps> = ({ link }) => {
    return (
        <>
            {!link.disabled ? (
                <motion.li whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} key={link.id}>
                    <Link href={link.url} className="block rounded px-3 py-2 text-white md:p-0" aria-current="page">
                        <span>{link.title}</span>
                    </Link>
                </motion.li>
            ) : (
                <div className="block rounded px-3 py-2 text-gray-400 md:p-0">
                    (<span>{link.title}</span>)
                </div>
            )}
        </>
    );
};
