import { Link } from "@inertiajs/react";
import {FaLinkedin} from "react-icons/fa";
import {AccountLinks} from "@/components/home/lib/AccountLinks";

export const FooterBottomSection = ({className}: any) => {
    return (
        <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm sm:text-center">© 2024&nbsp;
                <Link href="#" className="hover:underline">Humfurie™</Link>. All Rights Reserved.</span>
        </div>
    )
}
