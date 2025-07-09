import { useEffect, useState } from 'react';

export const useScreenSize = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('load', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('load', handleResize);
        };
    }, []);

    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
        setIsTablet(window.innerWidth > 768 && window.innerWidth < 1024);
        setIsDesktop(window.innerWidth > 1023);
    };
    return { isMobile, isTablet, isDesktop };
};
