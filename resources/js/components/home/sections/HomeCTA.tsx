import { MotionDiv } from '@/components/ui/motion';
import { useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Loader2, Mail } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface HomeCTAProps {
    email?: string;
    socialLinks?: {
        linkedin?: string;
        calendar?: string;
    };
}

const HomeCTA = ({ email }: HomeCTAProps) => {
    const { flash } = usePage<{ flash: { success?: string } }>().props;
    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
        website: '', // honeypot
    });


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('contact.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 5000);
            },
        });
    };

    return (
        <section className="relative overflow-hidden bg-[#1B3D2F] py-[clamp(80px,12vw,160px)] dark:bg-[#0A1210]">
            {/* Decorative radial gradients */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-[30%] -right-[20%] h-[500px] w-[500px] rounded-full bg-[#2A5E44] opacity-30 blur-[120px]" />
                <div className="absolute -bottom-[30%] -left-[20%] h-[400px] w-[400px] rounded-full bg-[#E8945A] opacity-10 blur-[100px]" />
            </div>

            <div className="primary-container relative z-10">
                <MotionDiv>
                    {/* Section label */}
                    <div className="section-label justify-center !mb-4 !text-[#5AAF7E]">Let's Connect</div>

                    <h2 className="font-display mx-auto text-center text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.2] font-light text-white">
                        Have a project in mind?
                        <br />
                        Let's build it together.
                    </h2>

                    <p className="mx-auto mt-5 max-w-[500px] text-center text-[1.05rem] leading-relaxed text-white/65">
                        I'm always open to discussing new projects, creative ideas, or opportunities to be part of something amazing.
                    </p>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-[600px] space-y-4">
                        {/* Honeypot — hidden from humans */}
                        <div className="absolute -left-[9999px]" aria-hidden="true">
                            <label htmlFor="website">Website</label>
                            <input
                                id="website"
                                type="text"
                                name="website"
                                value={data.website}
                                onChange={(e) => setData('website', e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        {/* Name + Email row */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-[0.92rem] text-white placeholder-white/40 outline-none backdrop-blur-sm transition-colors focus:border-[#5AAF7E] ${
                                        errors.name ? 'border-red-400/60' : 'border-white/10'
                                    }`}
                                />
                                {errors.name && <p className="mt-1.5 text-[0.8rem] text-red-400">{errors.name}</p>}
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-[0.92rem] text-white placeholder-white/40 outline-none backdrop-blur-sm transition-colors focus:border-[#5AAF7E] ${
                                        errors.email ? 'border-red-400/60' : 'border-white/10'
                                    }`}
                                />
                                {errors.email && <p className="mt-1.5 text-[0.8rem] text-red-400">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <textarea
                                placeholder="Tell me about your project..."
                                rows={5}
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                className={`w-full resize-none rounded-lg border bg-white/5 px-4 py-3 text-[0.92rem] text-white placeholder-white/40 outline-none backdrop-blur-sm transition-colors focus:border-[#5AAF7E] ${
                                    errors.message ? 'border-red-400/60' : 'border-white/10'
                                }`}
                            />
                            {errors.message && <p className="mt-1 text-[0.8rem] text-red-400">{errors.message}</p>}
                        </div>

                        {/* Submit + mailto */}
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-full bg-[#E8945A] px-7 py-3 text-[0.88rem] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-[#d4834e] disabled:pointer-events-none disabled:opacity-60"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>

                            {email && (
                                <a
                                    href={`mailto:${email}`}
                                    className="inline-flex items-center gap-2 text-[0.85rem] text-white/50 transition-colors hover:text-white/80"
                                >
                                    <Mail className="h-4 w-4" />
                                    or email directly
                                </a>
                            )}
                        </div>

                        {/* Success message */}
                        {showSuccess && (
                            <div className="flex items-center gap-2 rounded-lg border border-[#5AAF7E]/30 bg-[#5AAF7E]/10 px-4 py-3 text-[0.88rem] text-[#5AAF7E]">
                                <CheckCircle className="h-4 w-4 shrink-0" />
                                {flash?.success}
                            </div>
                        )}
                    </form>
                </MotionDiv>
            </div>
        </section>
    );
};

export default HomeCTA;
