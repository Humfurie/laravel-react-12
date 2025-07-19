import {NavDropdown} from "@/components/home/mobile/nav-dropdown";
import {MotionLi} from "@/components/home/lib/motion-li";
import { Link } from '@inertiajs/react';

const links = [
    {id: 1, url: "/", title: "Home", disabled: false},
    {id: 2, url: "/about", title: "About", disabled: true},
    {id: 3, url: "/contact", title: "Contact", disabled: true}
]
export default function Header({auth}: {auth: any}) {
    return (
        <>
            <header className="absolute top-0 left-0 w-full z-10">
                <nav className="border-r-0 bg-black/20">
                    <div className="w-full flex flex-wrap mx-auto p-4 md:justify-center lg:justify-start">

                        {/*Start of mobile section*/}
                        <section className="flex justify-between sm:hidden w-full">
                            <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                                <img src="/public/logo.png" alt="Humfurie" width={40} height={40}/>
                            </Link>
                            {/*<NavDropdown/>*/}
                        </section>
                        {/*End of mobile section*/}

                        <section className="hidden w-full md:flex md:w-auto md:order-1 lg:mx-20"
                                 id="navbar-sticky">
                            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
                                {links.map((link: { id: number, url: string, title: string, disabled:boolean }) => (
                                    <MotionLi key={link.id} link={link}/>
                                ))}
                            </ul>

                                <div className="flex items-center justify-end gap-4">
                                    {auth.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                            >
                                                Register
                                            </Link>
                                        </>
                                    )}
                                </div>
                        </section>
                    </div>
                </nav>
            </header>
        </>
    )
}
