import { Link } from "@inertiajs/react";

export const FooterBottomSection = () => {
    return (
        <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm sm:text-center">
                © {new Date().getFullYear()}&nbsp;
                <Link href="#" className="hover:underline">
                    Humfurie™
                </Link>
                . All Rights Reserved.
            </span>
        </div>
    );
};
