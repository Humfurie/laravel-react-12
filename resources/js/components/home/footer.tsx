import Image from "next/image";
import {FooterBottomSection} from "@/components/home/sections/FooterBottomSection";
import {IoMdMail} from "react-icons/io";
import {FaMobile, FaPhoneAlt} from "react-icons/fa";
import {AccountLinks} from "@/components/home/lib/AccountLinks";

export default function Footer() {
    return (
        <>
            <footer className="relative inset-x-0 bottom-0 h-20">
                <div className="mx-auto w-full max-w-screen p-4 py-6 lg:py-8">
                    <div className="primary-container md:grid md:grid-cols-5">
                        <div className="flex justify-center items-center col-span-1 md:mb-0">
                            <Image src="/Humphrey.png" alt="Humfurie" width={150} height={150}
                                   className="rounded-full shadow-xl"/>
                        </div>
                        <div className="col-span-4 lg:grid lg:grid-cols-4 md:mb-0">
                            <div className="justify-start p-4 lg:col-span-3">
                                <h1 className="text-black text-[20px] font-bold top-0 sm:text-[10px] md:text-[20px] sm:max-w-[60%] md:max-w-[65%] sm:leading-[20px] md:leading-[40px]">
                                    Hi! I&apos;m&nbsp;
                                    <span className="text-primary-orange">H</span>umphrey
                                </h1>
                                <p>&emsp;I&apos;m passionate about becoming a full-stack developer with a strong interest in
                                    server-side technologies. I&apos;m enthusiastic about learning and always eager to expand
                                    my knowledge in this field. I believe in continuous improvement and enjoy tackling
                                    challenges to enhance my skills. </p>
                            </div>
                            <div className=" p-4 sm:gap-6lg:col-span-1">
                                <div>
                                    <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase ">Contact</h2>
                                    <ul className="text-gray-500 font-medium h-full w-full">
                                        <li className="flex items-center mb-4">
                                            <IoMdMail/>&nbsp; <span>humfurie@gmail.com</span>
                                        </li>
                                        <li className="flex items-center mb-4">
                                            <FaPhoneAlt/>&nbsp; <span>(032)2669051</span>
                                        </li>
                                        <li className="flex items-center mb-4">
                                            <FaMobile/>&nbsp; <span>+63 9397535416</span>
                                        </li>
                                        <li className="flex justify-center md:items-start md:justify-start">
                                            <AccountLinks className="fill-primary-black"/>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8"/>
                    <FooterBottomSection/>
                </div>
            </footer>
        </>
    )
}
