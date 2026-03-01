import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof Link>;

export default function TextLink({ className = '', children, ...props }: LinkProps) {
    return (
        <Link
            className={cn(
                'text-[#1B3D2F] underline decoration-[#E5E4E0] underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:text-[#5AAF7E] dark:decoration-[#2A4A3A]',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}
