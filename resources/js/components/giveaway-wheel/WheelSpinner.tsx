import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WheelSpinnerProps {
    entryNames: string[];
    isSpinning: boolean;
    winner: string | null;
}

/**
 * Rolling Wheel/Slot Machine Style Winner Selection
 * Cycles through all entry names with increasing slowdown effect
 */
export default function WheelSpinner({ entryNames, isSpinning, winner }: WheelSpinnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [spinSpeed, setSpinSpeed] = useState(50);

    useEffect(() => {
        if (!isSpinning) {
            return;
        }

        let elapsed = 0;
        const maxDuration = 5000; // 5 seconds total spin time

        const interval = setInterval(() => {
            elapsed += spinSpeed;

            // Gradually slow down
            if (elapsed < maxDuration * 0.5) {
                // First half: fast spinning
                setSpinSpeed(50);
            } else if (elapsed < maxDuration * 0.7) {
                // 50-70%: medium speed
                setSpinSpeed(100);
            } else if (elapsed < maxDuration * 0.85) {
                // 70-85%: slow down
                setSpinSpeed(200);
            } else if (elapsed < maxDuration * 0.95) {
                // 85-95%: very slow
                setSpinSpeed(400);
            } else {
                // Final stretch: crawl
                setSpinSpeed(800);
            }

            setCurrentIndex((prev) => (prev + 1) % entryNames.length);
        }, spinSpeed);

        return () => clearInterval(interval);
    }, [isSpinning, spinSpeed, entryNames.length]);

    // Display slots: previous, current (highlighted), next
    const getPreviousIndex = (index: number) => (index - 1 + entryNames.length) % entryNames.length;
    const getNextIndex = (index: number) => (index + 1) % entryNames.length;

    if (entryNames.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border-4 border-yellow-400 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 p-8 shadow-2xl">
            {/* Decorative lights around the wheel */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-3 w-3 animate-pulse rounded-full"
                        style={{
                            left: i % 2 === 0 ? '0%' : '100%',
                            top: `${(i / 20) * 100}%`,
                            backgroundColor: i % 2 === 0 ? '#fbbf24' : '#ec4899',
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>

            {/* Main wheel display */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                {/* Title */}
                <div className="mb-4 flex items-center gap-2">
                    <Trophy className="h-8 w-8 animate-bounce text-yellow-400" />
                    <h3 className="text-3xl font-black text-white">{isSpinning ? 'SPINNING...' : winner ? 'WINNER!' : 'READY'}</h3>
                    <Trophy className="h-8 w-8 animate-bounce text-yellow-400" style={{ animationDelay: '0.2s' }} />
                </div>

                {/* Rolling slots container */}
                <div className="relative w-full max-w-2xl">
                    {/* Selection indicator */}
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <div className="h-24 w-full rounded-xl border-4 border-yellow-400 bg-yellow-400/20 shadow-[0_0_50px_rgba(251,191,36,0.5)]"></div>
                    </div>

                    {/* Scrolling names */}
                    <div className="relative flex flex-col items-center justify-center space-y-2 py-4">
                        {/* Previous name (faded) */}
                        <div className="flex h-20 w-full items-center justify-center opacity-30 transition-all">
                            <p className="text-center text-2xl font-bold text-white">{entryNames[getPreviousIndex(currentIndex)]}</p>
                        </div>

                        {/* Current name (highlighted) */}
                        <div
                            className={`flex h-24 w-full items-center justify-center transition-all duration-150 ${
                                !isSpinning && winner ? 'scale-110 animate-pulse' : 'scale-100'
                            }`}
                        >
                            <p className="text-center text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,1)]">
                                {!isSpinning && winner ? winner : entryNames[currentIndex]}
                            </p>
                        </div>

                        {/* Next name (faded) */}
                        <div className="flex h-20 w-full items-center justify-center opacity-30 transition-all">
                            <p className="text-center text-2xl font-bold text-white">{entryNames[getNextIndex(currentIndex)]}</p>
                        </div>
                    </div>
                </div>

                {/* Entry count */}
                <p className="mt-4 text-sm text-white/70">
                    Randomly selecting from <span className="font-bold text-yellow-400">{entryNames.length}</span> entries
                </p>

                {/* Winner celebration */}
                {!isSpinning && winner && (
                    <div className="mt-6 animate-bounce">
                        <div className="flex items-center gap-4 text-6xl">
                            <span>🎉</span>
                            <span>🎊</span>
                            <span>🏆</span>
                            <span>🎊</span>
                            <span>🎉</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Glow effects */}
            {isSpinning && (
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent"></div>
                </div>
            )}
        </div>
    );
}
