import {FaLinkedin} from "react-icons/fa";
import {JSX} from "react";

export const AccountLinks = ({ className }: { className: string }) => {
    const Links = [
        {
            title: 'Facebook',
            url: 'https://www.facebook.com/humphrey123',
            svg: (
                <svg className={`h-4 w-4 ${className}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                    <path
                        fillRule="evenodd"
                        d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            title: 'GitHub account',
            url: 'https://github.com/Humfurie',
            svg: (
                <svg className={`h-4 w-4 ${className}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                        clipRule="evenodd"
                    />
                </svg>
            ),
        },
        {
            title: 'LinkedIn account',
            url: 'https://www.linkedin.com/in/humphrey-singculan-09a459153/mnnnnnn',
            svg: <FaLinkedin className={`h-5 w-5 ${className}`} />,
        },
    ];

    return (
        <div className="mt-4 flex items-center justify-center">
            {Links.map((link: { title: string; url: string; svg: JSX.Element }, id: number) => {
                return (
                    <a href={link.url} className="mx-4 text-gray-500 hover:text-gray-900" key={id}>
                        {link.svg}
                        <span className="sr-only">{link.title}</span>
                    </a>
                );
            })}
        </div>
    );
};
