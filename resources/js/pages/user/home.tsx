import {type SharedData} from '@/types';
import {usePage} from '@inertiajs/react';
import Main from "@/components/home/main";
import {SkillSection} from "@/components/home/sections/SkillSection";
import {ExperienceSection} from "@/components/home/sections/ExperienceSection";
import Header from "@/components/home/header";

interface HomeProps {
    banner: {},
    skills: {},
    experience: {},
    footer: {},
}

export default function Home({banner, skills, experience, footer}: HomeProps) {
    const {auth} = usePage<SharedData>().props;

    return (
        <>
            <Header auth={auth}/>
            <Main/>
            <SkillSection/>
            <ExperienceSection/>
        </>
    )
}
