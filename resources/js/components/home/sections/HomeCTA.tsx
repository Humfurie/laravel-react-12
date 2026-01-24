import InquiryForm from '@/components/global/InquiryForm';
import MyCard from '@/components/global/MyCard';
import SectionTitle from '@/components/global/SectionTitle';
import { Calendar, Linkedin, Mail } from 'lucide-react';

interface HomeCTAProps {
    email?: string;
    socialLinks?: {
        linkedin?: string;
        calendar?: string;
    };
}

const blogData = [
    {
        imgUrl: '/images/projects/sample-project1.webp',
        title: 'Why You Should Learn React in 2025',
        excerpt: "Discover how React JS helps build modern web apps and why it's still relevant today.",
    },
];

const HomeCTA = ({ email, socialLinks }: HomeCTAProps) => {
    const hasContactLinks = email || socialLinks?.linkedin || socialLinks?.calendar;

    return (
        <section id="cta-section" className="home-blog call-to-action py-[40px] md:py-[80px]">
            <div className="primary-container flex min-h-[546px] flex-col items-center gap-[32px] lg:flex-row">
                {/* Blog Preview */}
                <div className="from-the-blogs w-full lg:w-[40%]">
                    <SectionTitle title="From the Blogs" link="/blog" />
                    <div className="mt-4 flex flex-col items-center justify-center">
                        {blogData.map((blog, index) => (
                            <MyCard key={index} imgUrl={blog.imgUrl} title={blog.title} excerpt={blog.excerpt} />
                        ))}
                    </div>

                    {/* Contact Links */}
                    {hasContactLinks && (
                        <div className="mt-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Get in Touch</h3>
                            <div className="flex flex-wrap gap-3">
                                {email && (
                                    <a
                                        href={`mailto:${email}`}
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email Me
                                    </a>
                                )}
                                {socialLinks?.linkedin && (
                                    <a
                                        href={socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </a>
                                )}
                                {socialLinks?.calendar && (
                                    <a
                                        href={socialLinks.calendar}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-green-300 hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-500/50 dark:hover:bg-green-500/10 dark:hover:text-green-400"
                                    >
                                        <Calendar className="h-4 w-4" />
                                        Schedule a Call
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Form */}
                <div className="form w-full lg:w-[60%]">
                    <InquiryForm />
                </div>
            </div>
        </section>
    );
};

export default HomeCTA;
