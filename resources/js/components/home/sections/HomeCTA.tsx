import { MotionDiv } from '@/components/ui/motion';
import { Link } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';

interface HomeCTAProps {
    email?: string;
    socialLinks?: {
        linkedin?: string;
        calendar?: string;
    };
}

const HomeCTA = ({ email }: HomeCTAProps) => {
    return (
        <section className="relative overflow-hidden bg-[#1B3D2F] py-[clamp(80px,12vw,160px)] text-center dark:bg-[#0A1210]">
            {/* Decorative radial gradients */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-[30%] -right-[20%] h-[500px] w-[500px] rounded-full bg-[#2A5E44] opacity-30 blur-[120px]" />
                <div className="absolute -bottom-[30%] -left-[20%] h-[400px] w-[400px] rounded-full bg-[#E8945A] opacity-10 blur-[100px]" />
            </div>

            <div className="primary-container relative z-10">
                <MotionDiv>
                    {/* Section label (centered) */}
                    <div className="section-label justify-center !text-[#5AAF7E] !mb-4">Let's Connect</div>

                    <h2 className="mx-auto font-display text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.2] font-light text-white">
                        Have a project in mind?
                        <br />
                        Let's build it together.
                    </h2>

                    <p className="mx-auto mt-5 max-w-[500px] text-[1.05rem] leading-relaxed text-white/65">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of
                        something amazing.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link
                            href="/guestbook"
                            className="inline-flex items-center gap-2 rounded-full bg-[#E8945A] px-7 py-3 text-[0.88rem] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#d4834e]"
                        >
                            Get in Touch
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        {email && (
                            <a
                                href={`mailto:${email}`}
                                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-7 py-3 text-[0.88rem] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:border-white/30"
                            >
                                <Mail className="h-4 w-4" />
                                Send an Email
                            </a>
                        )}
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
};

export default HomeCTA;
