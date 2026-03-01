import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh bg-[#FAFAF8] dark:bg-[#0A1210]">
            {/* Left side - Form */}
            <div className="flex w-full flex-col lg:w-1/2">
                {/* Mobile header with logo */}
                <div className="flex items-center justify-between border-b border-[#E5E4E0] p-4 dark:border-[#2A4A3A] lg:hidden">
                    <Link href={route('home')} className="flex items-center gap-2">
                        <img src="/logo.png" alt="humfurie" className="size-8" />
                        <span className="font-display text-lg font-normal text-[#1B3D2F] dark:text-[#E8E6E1]">humfurie</span>
                    </Link>
                </div>

                {/* Form content */}
                <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-8 lg:px-16 xl:px-24">
                    <div className="mx-auto w-full max-w-sm">
                        <div className="flex flex-col gap-6">
                            {/* Desktop logo - hidden on mobile */}
                            <Link href={route('home')} className="hidden items-center gap-2 lg:flex">
                                <img src="/logo.png" alt="humfurie" className="size-8" />
                                <span className="font-display text-lg font-normal text-[#1B3D2F] dark:text-[#E8E6E1]">humfurie</span>
                            </Link>

                            <div className="space-y-2">
                                <h1 className="font-display text-2xl font-normal tracking-tight text-[#1A1A1A] dark:text-[#E8E6E1]">{title}</h1>
                                <p className="text-sm text-[#9E9E95]">{description}</p>
                            </div>

                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Logo (hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:bg-[#F3F1EC] lg:p-12 dark:lg:bg-[#0F1A15]">
                <div className="relative flex items-center justify-center">
                    <img src="/logo.png" alt="humfurie" className="animate-float h-80 w-auto drop-shadow-2xl" />
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    25% {
                        transform: translateY(-12px) rotate(2deg);
                    }
                    50% {
                        transform: translateY(0) rotate(0deg);
                    }
                    75% {
                        transform: translateY(-8px) rotate(-2deg);
                    }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
