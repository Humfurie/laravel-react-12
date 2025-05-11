import { FooterBottomSection } from "@/components/home/sections/FooterBottomSection";
import { IoMdMail } from "react-icons/io";
import { FaMobile, FaPhoneAlt } from "react-icons/fa";
import { AccountLinks } from "@/components/home/lib/AccountLinks";

export default function Footer() {
    return (
        <footer className="bg-white w-full">
            <div className="max-w-screen-xl mx-auto p-4 py-8">
                <div className="primary-container grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Profile Image */}
                    <div className="flex justify-center items-start md:items-center col-span-1">
                        <img
                            src="/Humphrey.png"
                            alt="Humphrey"
                            width={150}
                            height={150}
                            className="rounded-full shadow-xl"
                        />
                    </div>

                    {/* Content Container */}
                    <div className="col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Bio Section */}
                        <div className="lg:col-span-3 space-y-4">
                            <h1 className="text-xl md:text-2xl font-bold text-black">
                                Hi! I&apos;m&nbsp;
                                <span className="text-primary-orange">H</span>umphrey
                            </h1>
                            <p className="text-gray-700">
                                I&apos;m passionate about becoming a full-stack developer with a strong interest in
                                server-side technologies. I&apos;m enthusiastic about learning and always eager to expand
                                my knowledge in this field. I believe in continuous improvement and enjoy tackling
                                challenges to enhance my skills.
                            </p>
                        </div>

                        {/* Contact Section */}
                        <div className="lg:col-span-1">
                            <h2 className="mb-4 text-sm font-semibold text-gray-900 uppercase">Contact</h2>
                            <ul className="text-gray-500 space-y-3">
                                <li className="flex items-center gap-2">
                                    <IoMdMail className="flex-shrink-0" />
                                    <span>humfurie@gmail.com</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaPhoneAlt className="flex-shrink-0" />
                                    <span>(032)2669051</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaMobile className="flex-shrink-0" />
                                    <span>+63 9397535416</span>
                                </li>
                                <li className="mt-4">
                                    <AccountLinks className="fill-primary-black" />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-gray-200" />
                <FooterBottomSection />
            </div>
        </footer>
    );
}
