import { Filament } from '@/components/Filament_Laravel';
import { FaDocker, FaLaravel } from 'react-icons/fa';
import { IoLogoJavascript } from 'react-icons/io5';
import { SiAdonisjs, SiAxios, SiJquery, SiNextdotjs, SiNginx, SiPhp, SiPostman, SiTailwindcss, SiXampp } from 'react-icons/si';

export const CATEGORIES = {
    BACKEND: 'Backend',
    FRONTEND: 'Frontend',
    TOOLS: 'Tools & DevOps',
    FRAMEWORKS: 'Frameworks & Libraries',
};
export const svgs = [
    {
        name: 'Laravel',
        icon: <FaLaravel className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.BACKEND,
    },
    {
        name: 'PHP',
        icon: <SiPhp className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.BACKEND,
    },
    {
        name: 'JavaScript',
        icon: <IoLogoJavascript className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRONTEND,
    },
    {
        name: 'Docker',
        icon: <FaDocker className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.TOOLS,
    },
    {
        name: 'Next.js',
        icon: <SiNextdotjs className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRAMEWORKS,
    },
    {
        name: 'Filament',
        icon: <Filament className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRAMEWORKS,
    },
    {
        name: 'AdonisJS',
        icon: <SiAdonisjs className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRAMEWORKS,
    },
    {
        name: 'Tailwind CSS',
        icon: <SiTailwindcss className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRONTEND,
    },
    {
        name: 'jQuery',
        icon: <SiJquery className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRONTEND,
    },
    {
        name: 'APIs',
        icon: <h1 className="text-4xl font-bold text-orange-600 sm:text-5xl">API</h1>,
        category: CATEGORIES.BACKEND,
    },
    {
        name: 'Axios',
        icon: <SiAxios className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.FRONTEND,
    },
    {
        name: 'Nginx',
        icon: <SiNginx className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.TOOLS,
    },
    {
        name: 'Xampp',
        icon: <SiXampp className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.TOOLS,
    },
    {
        name: 'Postman',
        icon: <SiPostman className="fill-orange-600 text-[60px] sm:text-[80px]" />,
        category: CATEGORIES.TOOLS,
    },
];
