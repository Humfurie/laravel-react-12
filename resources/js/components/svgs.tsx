import React from 'react';
import { FaLaravel, FaDocker } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import {SiAdonisjs, SiNextdotjs, SiPhp, SiTailwindcss, SiJquery, SiAxios, SiNginx, SiXampp, SiPostman } from "react-icons/si";
import {Filament} from "@/components/Filament_Laravel";

export const CATEGORIES = {
    BACKEND: 'Backend',
    FRONTEND: 'Frontend',
    TOOLS: 'Tools & DevOps',
    FRAMEWORKS: 'Frameworks & Libraries',
};
export const svgs = [
    {
        name: "Laravel",
        icon: <FaLaravel className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.BACKEND
    },
    {
        name: "PHP",
        icon: <SiPhp className="text-[60px] sm:text-[80px] fill-orange-600" />,
        category: CATEGORIES.BACKEND
    },
    {
        name: "JavaScript",
        icon: <IoLogoJavascript className="text-[60px] sm:text-[80px] fill-orange-600" />,
        category: CATEGORIES.FRONTEND
    },
    {
        name: "Docker",
        icon: <FaDocker className="text-[60px] sm:text-[80px] fill-orange-600" />,
        category: CATEGORIES.TOOLS
    },
    {
        name: "Next.js",
        icon: <SiNextdotjs className="text-[60px] sm:text-[80px] fill-orange-600" />,
        category: CATEGORIES.FRAMEWORKS
    },
    {
        name: "Filament",
        icon: <Filament className="text-[60px] sm:text-[80px] fill-orange-600" />,
        category: CATEGORIES.FRAMEWORKS
    },
    {
        name: "AdonisJS",
        icon: <SiAdonisjs className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.FRAMEWORKS
    },
    {
        name: "Tailwind CSS",
        icon: <SiTailwindcss className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.FRONTEND
    },
    {
        name: "jQuery",
        icon: <SiJquery className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.FRONTEND
    },
    {
        name: "APIs",
        icon: <h1 className="text-4xl sm:text-5xl font-bold text-orange-600">API</h1>,
        category: CATEGORIES.BACKEND
    },
    {
        name: "Axios",
        icon: <SiAxios className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.FRONTEND
    },
    {
        name: "Nginx",
        icon: <SiNginx className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.TOOLS
    },
    {
        name: "Xampp",
        icon: <SiXampp className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.TOOLS
    },
    {
        name: "Postman",
        icon: <SiPostman className="text-[60px] sm:text-[80px] fill-orange-600"/>,
        category: CATEGORIES.TOOLS
    },
];

