import { MotionDiv } from '@/components/ui/motion';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface HomeBannerProps {
    stats?: { label: string; value: string }[];
}

const HomeBanner = ({ stats }: HomeBannerProps) => {
    const [loaded, setLoaded] = useState(false);

    const bannerStats = stats?.length
        ? [
              { value: stats.find((s) => s.label === 'Years')?.value ?? '3+', label: 'Years exp.' },
              { value: stats.find((s) => s.label === 'Projects')?.value ?? '15+', label: 'Projects' },
              { value: stats.find((s) => s.label === 'Live Sites')?.value ?? '9', label: 'Deployments' },
          ]
        : [
              { value: '3+', label: 'Years exp.' },
              { value: '15+', label: 'Projects' },
              { value: '9', label: 'Deployments' },
          ];

    return (
        <section className="relative flex min-h-screen items-center pt-[72px]">
            {/* Subtle background gradients */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[#FDF5EE] opacity-60 blur-[120px] dark:opacity-20" />
                <div className="absolute -bottom-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[#E4EDE8] opacity-50 blur-[120px] dark:opacity-15" />
            </div>

            <div className="primary-container relative z-10 grid items-center gap-10 md:grid-cols-2 md:gap-[clamp(40px,6vw,100px)]">
                {/* Right: Hero image + stats overlay — DOM-first so mobile first-paint shows image before text */}
                <MotionDiv delay={0.4} variant="fadeIn" className="order-1 md:order-2">
                    <div className="relative">
                        {/* Decorative accent box behind image */}
                        <div className="pointer-events-none absolute -bottom-5 -left-5 z-0 hidden h-[200px] w-[200px] rounded-xl border border-[#E8945A] opacity-35 md:block dark:border-[#5AAF7E] dark:opacity-25" />

                        <div className="relative z-[1] aspect-[4/5] overflow-hidden rounded-xl bg-[#E4EDE8] dark:bg-[#1E3A2D]">
                            <picture>
                                <img
                                    src="/images/humphrey-banner.webp?v=1"
                                    alt="Humphrey - Software Developer"
                                    width="600"
                                    height="750"
                                    onLoad={() => setLoaded(true)}
                                    className="h-full w-full object-cover transition-opacity duration-700 [filter:grayscale(20%)_contrast(1.05)]"
                                    style={{ opacity: loaded ? 1 : 0 }}
                                    fetchPriority="high"
                                />
                            </picture>
                        </div>

                        {/* Stats overlay card */}
                        <div className="absolute -right-4 -bottom-8 z-[2] rounded-xl border border-[#E5E4E0] bg-white/95 px-7 py-5 shadow-lg backdrop-blur-sm md:-left-10 md:bottom-8 md:right-auto dark:border-[#2A4A3A] dark:bg-[#162820]/95">
                            <div className="flex gap-8">
                                {bannerStats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <div className="font-display text-[1.6rem] font-medium text-[#1B3D2F] dark:text-[#E8E6E1]">
                                            {stat.value}
                                        </div>
                                        <div className="text-[0.72rem] text-[#6B6B63] dark:text-[#9E9E95]">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </MotionDiv>

                {/* Left: Text content */}
                <MotionDiv delay={0.2} className="order-2 md:order-1">
                    <span className="text-[0.82rem] font-medium tracking-[0.15em] uppercase text-[#E8945A]">
                        Software Developer
                    </span>

                    <h1 className="mt-4 font-display text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] font-light text-[#1B3D2F] dark:text-[#E8E6E1]">
                        Crafting{' '}
                        <em className="not-italic text-[#2A5E44] dark:text-[#5AAF7E]">digital experiences</em> with
                        precision
                    </h1>

                    <p className="mt-6 max-w-[480px] text-[1.05rem] leading-relaxed text-[#6B6B63] dark:text-[#9E9E95]">
                        Full-stack developer specializing in Laravel & React, building elegant and performant web
                        applications that make a difference.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-7 py-3 text-[0.88rem] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1B3D2F] hover:shadow-[0_8px_24px_rgba(27,61,47,0.25)] dark:bg-[#5AAF7E] dark:text-[#0F1A15] dark:hover:bg-[#4A9F6E]"
                        >
                            View Projects
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/guestbook"
                            className="inline-flex items-center gap-2 rounded-full border border-[#E5E4E0] bg-transparent px-7 py-3 text-[0.88rem] font-medium text-[#1A1A1A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1B3D2F] hover:text-[#1B3D2F] dark:border-[#2A4A3A] dark:text-[#E8E6E1] dark:hover:border-[#5AAF7E] dark:hover:text-[#5AAF7E]"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </MotionDiv>
            </div>
        </section>
    );
};

export default HomeBanner;
