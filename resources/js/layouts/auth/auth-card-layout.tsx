import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#F3F1EC] p-6 dark:bg-[#0A1210] md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex items-center gap-2 self-center">
                    <div className="flex h-9 w-9 items-center justify-center">
                        <AppLogoIcon className="size-9 fill-current text-[#1B3D2F] dark:text-[#5AAF7E]" />
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl border-[#E5E4E0] dark:border-[#2A4A3A] dark:bg-[#162820]">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="font-display text-xl font-normal text-[#1A1A1A] dark:text-[#E8E6E1]">{title}</CardTitle>
                            <CardDescription className="text-[#9E9E95]">{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
