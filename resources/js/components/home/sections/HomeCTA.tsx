import { MotionDiv } from '@/components/ui/motion';
import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Linkedin, Mail, MessageSquareHeart } from 'lucide-react';

interface HomeCTAProps {
    email?: string;
    socialLinks?: {
        linkedin?: string;
        calendar?: string;
    };
}

const HomeCTA = ({ email, socialLinks }: HomeCTAProps) => {
    const hasContactLinks = email || socialLinks?.linkedin || socialLinks?.calendar;

    return (
        <section id="cta-section" className="home-blog call-to-action py-[40px] md:py-[80px]">
            <div className="primary-container flex min-h-[400px] flex-col items-center gap-[32px] lg:flex-row">
                {/* Contact Links */}
                {hasContactLinks && (
                    <MotionDiv className="w-full lg:w-[40%]">
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
                    </MotionDiv>
                )}

                {/* Guestbook CTA */}
                <MotionDiv delay={0.2} className={`form w-full ${hasContactLinks ? 'lg:w-[60%]' : ''}`}>
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center dark:from-gray-800 dark:to-gray-900">
                        <MessageSquareHeart className="mx-auto mb-4 h-12 w-12 text-orange-500" />
                        <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Leave a Message</h3>
                        <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
                            Sign the guestbook and say hello! I'd love to hear from fellow developers and visitors.
                        </p>
                        <Link
                            href="/guestbook"
                            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg"
                        >
                            Visit Guestbook
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
};

export default HomeCTA;
