import { Link } from '@inertiajs/react';
import { motion, useCycle } from 'framer-motion';
import { useEffect } from 'react';

export const NavDropdown = () => {
    const [mobileNav, toggleMobileNav] = useCycle(false, true);

    useEffect(() => {
        if (mobileNav) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [mobileNav]);

    return (
        <nav className="flex items-center">
            <div className="relative z-20">
                <motion.button animate={mobileNav ? 'open' : 'close'} onClick={() => toggleMobileNav()} className="flex flex-col space-y-1">
                    <motion.span
                        variants={{
                            closed: { rotate: 0, y: 0 },
                            open: { rotate: 45, y: 5 },
                        }}
                        className="block h-px w-5 bg-white"
                    ></motion.span>
                    <motion.span
                        variants={{
                            closed: { opacity: 1 },
                            open: { opacity: 0 },
                        }}
                        className="block h-px w-5 bg-white"
                    ></motion.span>
                    <motion.span
                        variants={{
                            closed: { rotate: 0, y: 0 },
                            open: { rotate: -45, y: -5 },
                        }}
                        className="block h-px w-5 bg-white"
                    ></motion.span>
                </motion.button>
            </div>
            {mobileNav && (
                <motion.div
                    transition={{ delay: 2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-opacity-50 fixed inset-0 z-10 flex w-full flex-col items-center space-y-10 bg-black pt-[100px] backdrop-blur"
                >
                    <div className="">
                        <ul className="space-y-5 text-4xl font-bold text-white">
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
    );
};
