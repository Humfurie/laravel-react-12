import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            {/* Modern H monogram logo */}
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M9 8h3v6.5h8V8h3v16h-3v-7h-8v7H9V8z" fill="white" />
        </svg>
    );
}
