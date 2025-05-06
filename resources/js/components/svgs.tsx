import React, {JSX} from 'react';
import { FaLaravel, FaDocker } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import {SiAdonisjs, SiNextdotjs, SiPhp, SiTailwindcss, SiJquery, SiAxios, SiVuedotjs, SiNginx, SiXampp, SiPostman } from "react-icons/si";
import {Filament} from "@/components/Filament_Laravel";
export const svgs: { name: string, icon: JSX.Element }[] = [
    {
        name: "laravel",
        icon: <FaLaravel className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "php",
        icon: <SiPhp  className="text-[100px] sm:text-[150px] fill-orange-600" />
    },
    {
        name: "javascript",
        icon: <IoLogoJavascript className="text-[100px] sm:text-[150px] fill-orange-600" />
    },
    {
        name: "docker",
        icon: <FaDocker className="text-[100px] sm:text-[150px] fill-orange-600" />
    },
    {
        name: "next js",
        icon: <SiNextdotjs className="text-[100px] sm:text-[150px] fill-orange-600" />
    },
    {
        name: "filament",
        icon: <Filament className="text-[100px] sm:text-[150px] fill-orange-600" />
    },
    {
        name: "adonis js",
        icon: <SiAdonisjs className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "tailwind css",
        icon: <SiTailwindcss  className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "JQuery",
        icon: <SiJquery  className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "APIs",
        icon: <h1 className="text-5xl font-bold text-orange-600">API</h1>
    },
    {
        name: "Axios",
        icon: <SiAxios  className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "Nginx",
        icon: <SiNginx  className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "Xampp",
        icon: <SiXampp  className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },
    {
        name: "Postman",
        icon: <SiPostman className="text-[100px] sm:text-[150px] fill-orange-600"/>
    },

    // {
    //     name: "Vue",
    //     icon: <SiVuedotjs  className="tech"/>
    // },
];
