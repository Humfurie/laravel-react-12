import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CasinoRollProps {
    names: string[];
    winner?: string | null;
    winnerAnnounced?: boolean;
    isSpinning?: boolean;
    onPickWinner?: () => void;
    canPickWinner?: boolean;
    isAdmin?: boolean;
}

/**
 * CasinoRoll Component
 *
 * Displays a casino-style rolling animation of participant names
 * Similar to slot machines, names scroll continuously in vertical columns
 * When winner is announced, stops animation and shows celebration
 * When spinning, shows rapid animation like pulling a slot machine lever
 */
export default function CasinoRoll({
    names,
    winner,
    winnerAnnounced = false,
    isSpinning = false,
    onPickWinner,
    canPickWinner = false,
    isAdmin = false,
}: CasinoRollProps) {
    const [displayNames, setDisplayNames] = useState<string[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        // Duplicate names to create seamless loop
        // Repeat 3 times for extra smooth infinite scroll
        if (names.length > 0) {
            const repeated = [...names, ...names, ...names];
            setDisplayNames(repeated);
        }
    }, [names]);

    if (names.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-200 bg-purple-50/30 p-8">
                <Trophy className="mb-4 h-16 w-16 text-purple-300" />
                <p className="text-center text-lg font-semibold text-purple-600">No entries yet</p>
                <p className="text-center text-sm text-purple-500">Be the first to join this raffle!</p>
            </div>
        );
    }

    // Winner Celebration Mode
    if (winnerAnnounced && winner) {
        return (
            <div className="relative overflow-hidden rounded-xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-600 via-yellow-500 to-orange-500 p-1 shadow-2xl">
                {/* Confetti Animation */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-confetti absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-${Math.random() * 20}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{
                                    backgroundColor: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6'][Math.floor(Math.random() * 5)],
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="relative rounded-lg bg-gradient-to-br from-black/90 via-black/80 to-black/90 backdrop-blur-sm">
                    {/* Header */}
                    <div className="border-b border-yellow-400/50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-6">
                        <div className="flex items-center justify-center gap-3">
                            <Trophy className="h-8 w-8 animate-bounce text-yellow-400" />
                            <h3 className="animate-pulse text-center text-2xl font-bold text-yellow-400">We Have a Winner!</h3>
                            <Trophy className="h-8 w-8 animate-bounce text-yellow-400" style={{ animationDelay: '0.2s' }} />
                        </div>
                    </div>

                    {/* Winner Display */}
                    <div className="relative flex min-h-[400px] flex-col items-center justify-center p-12">
                        {/* Glowing background effect */}
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-yellow-500/10 via-yellow-400/20 to-orange-500/10"></div>

                        <div className="relative z-10 space-y-8 text-center">
                            {/* Trophy Icon */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <Trophy className="h-24 w-24 animate-bounce text-yellow-400" />
                                    {/* Glow rings */}
                                    <div className="absolute inset-0 -m-4 animate-ping rounded-full border-4 border-yellow-400/30"></div>
                                    <div
                                        className="absolute inset-0 -m-8 animate-ping rounded-full border-4 border-yellow-400/20"
                                        style={{ animationDelay: '0.5s' }}
                                    ></div>
                                </div>
                            </div>

                            {/* Winner Name */}
                            <div className="space-y-4">
                                <p className="text-xl font-medium tracking-widest text-yellow-300 uppercase">Congratulations to</p>
                                <h2 className="animate-pulse text-6xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
                                    {winner}
                                </h2>
                            </div>

                            {/* Decorative stars */}
                            <div className="flex items-center justify-center gap-4 text-4xl">
                                <span className="animate-spin-slow">⭐</span>
                                <span className="animate-bounce">🎉</span>
                                <span className="animate-spin-slow" style={{ animationDelay: '1s' }}>
                                    ⭐
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-yellow-400/50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-6 py-4">
                        <p className="text-center text-sm text-yellow-300">🎊 Winner will be contacted shortly • Thank you to all participants! 🎊</p>
                    </div>
                </div>

                {/* Additional animated corner decorations */}
                <div className="absolute top-2 left-2 h-6 w-6 animate-ping rounded-full bg-yellow-400"></div>
                <div className="absolute top-2 right-2 h-6 w-6 animate-ping rounded-full bg-yellow-400" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute bottom-2 left-2 h-6 w-6 animate-ping rounded-full bg-yellow-400" style={{ animationDelay: '0.6s' }}></div>
                <div className="absolute right-2 bottom-2 h-6 w-6 animate-ping rounded-full bg-yellow-400" style={{ animationDelay: '0.9s' }}></div>

                <style>{`
                    @keyframes confetti {
                        0% {
                            transform: translateY(0) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(720deg);
                            opacity: 0;
                        }
                    }

                    .animate-confetti {
                        animation: confetti linear infinite;
                    }

                    @keyframes spin-slow {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    .animate-spin-slow {
                        animation: spin-slow 3s linear infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-xl border-4 ${
                isSpinning ? 'animate-pulse border-red-500' : 'border-gradient-to-r from-yellow-400 via-purple-500 to-pink-500'
            } bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-1 shadow-2xl`}
        >
            {/* Casino lights effect */}
            <div
                className={`absolute inset-0 ${
                    isSpinning ? 'animate-pulse bg-red-500/30' : 'animate-pulse bg-gradient-to-r from-yellow-400/20 via-purple-500/20 to-pink-500/20'
                }`}
            ></div>

            <div className="relative rounded-lg bg-black/80 backdrop-blur-sm">
                {/* Header */}
                <div
                    className={`border-b ${
                        isSpinning
                            ? 'border-red-500/50 bg-gradient-to-r from-red-500/20 to-orange-500/20'
                            : 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-purple-500/10'
                    } px-6 py-4`}
                >
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className={`h-6 w-6 ${isSpinning ? 'animate-spin text-red-400' : 'animate-pulse text-yellow-400'}`} />
                        <h3 className={`text-center text-xl font-bold ${isSpinning ? 'animate-pulse text-red-400' : 'text-yellow-400'}`}>
                            {isSpinning ? '🎰 SPINNING...' : 'Live Participants'}
                        </h3>
                        <Trophy className={`h-6 w-6 ${isSpinning ? 'animate-spin text-red-400' : 'animate-pulse text-yellow-400'}`} />
                    </div>
                    <p className={`mt-1 text-center text-sm ${isSpinning ? 'animate-pulse text-red-300' : 'text-purple-300'}`}>
                        {isSpinning ? 'Selecting winner...' : `${names.length} ${names.length === 1 ? 'Entry' : 'Entries'}`}
                    </p>
                </div>

                {/* Rolling names container */}
                <div className="relative h-[400px] overflow-hidden">
                    {/* Particle effects during spinning */}
                    {isSpinning && (
                        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                            {[...Array(30)].map((_, i) => (
                                <div
                                    key={i}
                                    className="animate-particle absolute"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${1 + Math.random() * 2}s`,
                                    }}
                                >
                                    <div
                                        className="h-2 w-2 rounded-full blur-sm"
                                        style={{
                                            backgroundColor: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7'][Math.floor(Math.random() * 4)],
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Highlighted Center Spotlight */}
                    <div className="pointer-events-none absolute inset-0 z-10">
                        {/* Top gradient fade */}
                        <div className="absolute top-0 right-0 left-0 h-32 bg-gradient-to-b from-black/90 via-black/50 to-transparent"></div>

                        {/* Center spotlight window - enhanced when spinning */}
                        <div
                            className={`absolute top-1/2 left-1/2 h-24 w-full -translate-x-1/2 -translate-y-1/2 ${isSpinning ? 'animate-pulse' : ''}`}
                        >
                            {/* Glowing border top */}
                            <div
                                className={`absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-transparent ${isSpinning ? 'via-red-500' : 'via-yellow-400'} to-transparent shadow-[0_0_20px_rgba(250,204,21,0.9)]`}
                            ></div>
                            {/* Glowing border bottom */}
                            <div
                                className={`absolute right-0 bottom-0 left-0 h-[3px] bg-gradient-to-r from-transparent ${isSpinning ? 'via-red-500' : 'via-yellow-400'} to-transparent shadow-[0_0_20px_rgba(250,204,21,0.9)]`}
                            ></div>
                            {/* Spotlight glow effect - enhanced when spinning */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-r from-transparent ${isSpinning ? 'animate-pulse via-red-400/20' : 'via-yellow-400/15'} to-transparent`}
                            ></div>
                            {/* Additional side glow bars when spinning */}
                            {isSpinning && (
                                <>
                                    <div className="absolute top-0 bottom-0 left-0 w-[3px] animate-pulse bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.9)]"></div>
                                    <div className="absolute top-0 right-0 bottom-0 w-[3px] animate-pulse bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.9)]"></div>
                                </>
                            )}
                        </div>

                        {/* Bottom gradient fade */}
                        <div className="absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    </div>

                    <div
                        className={`${isPaused && !isSpinning ? '' : isSpinning ? 'animate-rapid-spin' : 'animate-scroll'}`}
                        onMouseEnter={() => !isSpinning && setIsPaused(true)}
                        onMouseLeave={() => !isSpinning && setIsPaused(false)}
                        style={{
                            animation: isPaused && !isSpinning ? 'none' : undefined,
                        }}
                    >
                        {displayNames.map((name, index) => {
                            const isWinner = winner && name === winner;
                            return (
                                <div
                                    key={`${name}-${index}`}
                                    className={`flex items-center justify-center px-6 py-4 transition-all duration-300 ${
                                        isWinner
                                            ? 'bg-gradient-to-r from-yellow-500/40 via-yellow-400/30 to-yellow-500/40 text-yellow-300'
                                            : isSpinning
                                              ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 text-red-200 blur-[0.5px]'
                                              : 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-200 hover:bg-purple-800/50'
                                    } `}
                                    style={{
                                        borderBottom: isSpinning ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid rgba(126, 34, 206, 0.3)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        {isWinner && <Trophy className="h-5 w-5 animate-bounce text-yellow-400" />}
                                        <span
                                            className={`text-lg font-semibold ${isWinner ? 'animate-pulse text-2xl' : isSpinning ? 'font-bold' : ''}`}
                                        >
                                            {name}
                                        </span>
                                        {isWinner && <Trophy className="h-5 w-5 animate-bounce text-yellow-400" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <style>{`
                    @keyframes scroll {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(-66.666%);
                        }
                    }

                    @keyframes rapid-spin {
                        0% {
                            transform: translateY(0);
                        }
                        100% {
                            transform: translateY(-66.666%);
                        }
                    }

                    @keyframes particle {
                        0% {
                            transform: translate(0, 0) scale(0) rotate(0deg);
                            opacity: 0;
                        }
                        25% {
                            opacity: 1;
                        }
                        50% {
                            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.5) rotate(180deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0) rotate(360deg);
                            opacity: 0;
                        }
                    }

                    .animate-scroll {
                        animation: scroll ${names.length * 2.5}s linear infinite;
                    }

                    .animate-rapid-spin {
                        animation: rapid-spin 0.5s linear infinite;
                    }

                    .animate-particle {
                        animation: particle ease-out infinite;
                    }
                `}</style>

                {/* Footer - Pick Winner Button */}
                <div
                    className={`border-t ${
                        isSpinning
                            ? 'border-red-700/50 bg-gradient-to-r from-red-900/50 to-orange-900/50'
                            : 'border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-indigo-900/50'
                    } px-6 py-4`}
                >
                    {isSpinning ? (
                        <p className="animate-pulse text-center text-xs font-bold text-red-400">🎰 SELECTING WINNER... PLEASE WAIT!</p>
                    ) : canPickWinner && onPickWinner && isAdmin ? (
                        // Admin button to pick winner with fast spinning
                        <button
                            onClick={onPickWinner}
                            className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-lg font-bold text-black shadow-lg transition-all duration-200 hover:scale-105 hover:from-yellow-600 hover:to-orange-600 active:scale-95"
                        >
                            <Trophy className="h-5 w-5 animate-bounce" />
                            <span>🎰 SPIN & PICK WINNER!</span>
                            <Trophy className="h-5 w-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </button>
                    ) : (
                        <p className="text-center text-xs text-purple-400">🎰 Infinite rolling • Hover to pause • Casino-style continuous scroll</p>
                    )}
                </div>
            </div>

            {/* Animated corner decorations */}
            <div className="absolute top-2 left-2 h-4 w-4 animate-ping rounded-full bg-yellow-400/50"></div>
            <div className="absolute top-2 right-2 h-4 w-4 animate-ping rounded-full bg-purple-400/50" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-2 left-2 h-4 w-4 animate-ping rounded-full bg-pink-400/50" style={{ animationDelay: '1s' }}></div>
            <div className="absolute right-2 bottom-2 h-4 w-4 animate-ping rounded-full bg-yellow-400/50" style={{ animationDelay: '1.5s' }}></div>
        </div>
    );
}
