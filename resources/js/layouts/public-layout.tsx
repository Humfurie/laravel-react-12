import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import ScrollProgress from '@/components/global/ScrollProgress';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <ScrollProgress />
            <FloatingNav />
            {children}
            <Footer />
        </>
    );
}
