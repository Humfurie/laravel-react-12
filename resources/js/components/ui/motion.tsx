import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react';

// Animation variants for reuse
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

export const scaleUp: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
};

// Default transition settings
const defaultTransition = {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1] as const,
};

// Viewport settings
const defaultViewport = {
    once: true,
    margin: '-50px',
};

interface MotionSectionProps extends ComponentProps<typeof motion.section> {
    children: ReactNode;
    className?: string;
    delay?: number;
}

interface MotionDivProps extends ComponentProps<typeof motion.div> {
    children: ReactNode;
    className?: string;
    delay?: number;
    variant?: 'fadeUp' | 'fadeIn' | 'scaleUp' | 'slideLeft' | 'slideRight';
}

interface MotionStaggerProps extends ComponentProps<typeof motion.div> {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

// Get variant by name
const getVariant = (name: MotionDivProps['variant']): Variants => {
    switch (name) {
        case 'fadeIn':
            return fadeIn;
        case 'scaleUp':
            return scaleUp;
        case 'slideLeft':
            return slideInLeft;
        case 'slideRight':
            return slideInRight;
        default:
            return fadeUp;
    }
};

/**
 * Hook: returns true if the element was already visible in the viewport on mount.
 * Elements already visible should NOT animate (prevents jitter on page load).
 * Elements below the fold SHOULD animate when scrolled into view.
 */
function useIsInitiallyVisible<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const checked = useRef(false);

    useEffect(() => {
        if (checked.current) return;
        checked.current = true;

        if (!ref.current) {
            // No ref yet, assume it should animate
            setShouldAnimate(true);
            return;
        }

        const rect = ref.current.getBoundingClientRect();
        // If element top is below the viewport (with some margin), it should animate on scroll
        const isBelowFold = rect.top > window.innerHeight - 50;
        setShouldAnimate(isBelowFold);
    }, []);

    return { ref, shouldAnimate };
}

/**
 * Animated section that fades up when scrolled into view
 */
export function MotionSection({ children, className, delay = 0, ...props }: MotionSectionProps) {
    const prefersReducedMotion = useReducedMotion();
    const { ref, shouldAnimate } = useIsInitiallyVisible<HTMLElement>();

    return (
        <motion.section
            ref={ref}
            initial={shouldAnimate && !prefersReducedMotion ? 'hidden' : 'visible'}
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ ...defaultTransition, delay: shouldAnimate ? delay : 0, duration: prefersReducedMotion ? 0 : 0.5 }}
            className={className}
            {...props}
        >
            {children}
        </motion.section>
    );
}

/**
 * Animated div with configurable animation variant
 */
export function MotionDiv({ children, className, delay = 0, variant = 'fadeUp', ...props }: MotionDivProps) {
    const prefersReducedMotion = useReducedMotion();
    const { ref, shouldAnimate } = useIsInitiallyVisible<HTMLDivElement>();

    return (
        <motion.div
            ref={ref}
            initial={shouldAnimate && !prefersReducedMotion ? 'hidden' : 'visible'}
            whileInView="visible"
            viewport={defaultViewport}
            variants={getVariant(variant)}
            transition={{ ...defaultTransition, delay: shouldAnimate ? delay : 0, duration: prefersReducedMotion ? 0 : 0.5 }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Container that staggers children animations
 */
export function MotionStagger({ children, className, staggerDelay = 0.1, ...props }: MotionStaggerProps) {
    const { ref, shouldAnimate } = useIsInitiallyVisible<HTMLDivElement>();

    return (
        <motion.div
            ref={ref}
            initial={shouldAnimate ? 'hidden' : 'visible'}
            whileInView="visible"
            viewport={defaultViewport}
            variants={{
                hidden: { opacity: 1 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: shouldAnimate ? staggerDelay : 0,
                        delayChildren: shouldAnimate ? 0.1 : 0,
                    },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Child element for use inside MotionStagger
 */
export function MotionItem({ children, className, variant = 'fadeUp', ...props }: Omit<MotionDivProps, 'delay'>) {
    return (
        <motion.div variants={getVariant(variant)} transition={defaultTransition} className={className} {...props}>
            {children}
        </motion.div>
    );
}

/**
 * Animated heading
 */
export function MotionH2({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    const prefersReducedMotion = useReducedMotion();
    const { ref, shouldAnimate } = useIsInitiallyVisible<HTMLHeadingElement>();

    return (
        <motion.h2
            ref={ref}
            initial={shouldAnimate && !prefersReducedMotion ? 'hidden' : 'visible'}
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ ...defaultTransition, delay: shouldAnimate ? delay : 0, duration: prefersReducedMotion ? 0 : 0.5 }}
            className={className}
        >
            {children}
        </motion.h2>
    );
}

/**
 * Animated paragraph
 */
export function MotionP({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
    const prefersReducedMotion = useReducedMotion();
    const { ref, shouldAnimate } = useIsInitiallyVisible<HTMLParagraphElement>();

    return (
        <motion.p
            ref={ref}
            initial={shouldAnimate && !prefersReducedMotion ? 'hidden' : 'visible'}
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ ...defaultTransition, delay: shouldAnimate ? delay : 0, duration: prefersReducedMotion ? 0 : 0.5 }}
            className={className}
        >
            {children}
        </motion.p>
    );
}
