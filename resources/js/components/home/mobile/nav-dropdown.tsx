import {motion, useCycle} from "framer-motion"
import { Link } from '@inertiajs/react';
import {useEffect} from "react";

export const NavDropdown = () => {
    const [mobileNav, toggleMobileNav] = useCycle(false, true)

    useEffect(() => {
        if (mobileNav) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [mobileNav]);

    return (
        <nav className="flex items-center">
            <div
                className="relative z-20">
                <motion.button
                    animate={mobileNav ? "open" : "close"}
                    onClick={() => toggleMobileNav()}
                    className="flex flex-col space-y-1">
                    <motion.span variants={{
                        closed: {rotate: 0, y: 0},
                        open: {rotate: 45, y: 5}
                    }} className="w-5 h-px bg-white block"></motion.span>
                    <motion.span variants={{
                        closed: {opacity: 1},
                        open: {opacity: 0, }
                    }} className="w-5 h-px bg-white block"></motion.span>
                    <motion.span variants={{
                        closed: {rotate: 0, y: 0},
                        open: {rotate: -45, y: -5}
                    }} className="w-5 h-px bg-white block"></motion.span>
                </motion.button>
            </div>
            {mobileNav && (
                <motion.div
                    transition={{ delay: 2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed flex flex-col items-center inset-0 w-full bg-black bg-opacity-50 pt-[100px] space-y-10 backdrop-blur z-10">
                    <div className="">
                        <ul className="text-white font-bold text-4xl space-y-5">
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <div className="text-gray-400">(About)</div>
                            </li>
                            <li>
                                <div className="text-gray-400">(Contact)</div>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            )}
        </nav>
    )
}
