import { motion, type Variants } from 'framer-motion';
import { type ComponentProps, type ReactNode } from 'react';

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

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Default transition settings - respects prefers-reduced-motion
const defaultTransition = {
    duration: prefersReducedMotion ? 0 : 0.5,
    ease: [0.25, 0.1, 0.25, 1] as const, // Custom easing for smooth feel
};

// Viewport settings - triggers slightly before element is visible
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
 * Animated section that fades up when scrolled into view
 */
export function MotionSection({ children, className, delay = 0, ...props }: MotionSectionProps) {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ ...defaultTransition, delay }}
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
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={getVariant(variant)}
            transition={{ ...defaultTransition, delay }}
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
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={{
                hidden: { opacity: 1 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: 0.1,
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
    return (
        <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ ...defaultTransition, delay }}
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
    return (
        <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            transition={{ ...defaultTransition, delay }}
            className={className}
        >
            {children}
        </motion.p>
    );
}
