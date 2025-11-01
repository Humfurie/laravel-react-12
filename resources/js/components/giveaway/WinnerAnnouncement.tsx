import { Button } from '@/components/ui/button';
import { Gift, Sparkles, Users } from 'lucide-react';

interface WinnerAnnouncementProps {
    totalEntries: number;
    winner?: string | null;
    winnerAnnounced?: boolean;
    isSelecting?: boolean;
    onSelectWinner?: () => void;
    canSelectWinner?: boolean;
    isAdmin?: boolean;
}

/**
 * WinnerAnnouncement Component
 *
 * Displays giveaway participant information and winner announcement
 * Clean, professional display with celebratory animations (AdSense-safe)
 */
export default function WinnerAnnouncement({
    totalEntries,
    winner,
    winnerAnnounced = false,
    isSelecting = false,
    onSelectWinner,
    canSelectWinner = false,
    isAdmin = false,
}: WinnerAnnouncementProps) {
    if (totalEntries === 0) {
        return (
            <div className="border-primary/20 bg-primary/5 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <Gift className="text-primary/40 mb-4 h-16 w-16" />
                <p className="text-foreground text-center text-lg font-semibold">No entries yet</p>
                <p className="text-muted-foreground text-center text-sm">Be the first to join this giveaway!</p>
            </div>
        );
    }

    // Winner has been announced
    if (winnerAnnounced && winner) {
        return (
            <div className="border-primary from-primary/10 to-primary/5 relative overflow-hidden rounded-lg border-2 bg-gradient-to-br p-8">
                {/* Sparkle particles */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-sparkle absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        >
                            <Sparkles
                                className="h-4 w-4"
                                style={{
                                    color: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6'][Math.floor(Math.random() * 5)],
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-center">
                    <div className="bg-primary text-primary-foreground mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                        <Gift className="h-10 w-10 animate-bounce" />
                    </div>
                    <h3 className="text-foreground mb-2 text-2xl font-bold">Congratulations!</h3>
                    <p className="text-primary mb-4 animate-pulse text-center text-3xl font-bold">{winner}</p>
                    <p className="text-muted-foreground text-center text-sm">
                        Selected from {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                    </p>
                </div>

                <style>{`
                    @keyframes sparkle {
                        0%, 100% {
                            opacity: 0;
                            transform: scale(0) rotate(0deg);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1) rotate(180deg);
                        }
                    }

                    .animate-sparkle {
                        animation: sparkle ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    // Selecting winner animation
    if (isSelecting) {
        return (
            <div className="border-primary/50 from-primary/20 to-primary/10 relative overflow-hidden rounded-lg border-2 bg-gradient-to-br p-8 shadow-lg">
                {/* Animated glow particles */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="animate-float absolute"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${3 + Math.random() * 2}s`,
                            }}
                        >
                            <div
                                className="h-3 w-3 rounded-full blur-sm"
                                style={{
                                    backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 3)],
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Pulsing border effect */}
                <div className="border-primary/30 pointer-events-none absolute inset-0 animate-pulse rounded-lg border-4"></div>

                <div className="relative z-10 flex min-h-[300px] flex-col items-center justify-center space-y-6">
                    <div className="relative">
                        <div className="bg-primary/20 flex h-24 w-24 animate-pulse items-center justify-center rounded-full">
                            <Sparkles className="text-primary h-12 w-12 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        {/* Expanding rings */}
                        <div className="border-primary/30 absolute inset-0 -m-4 animate-ping rounded-full border-4"></div>
                        <div
                            className="border-primary/20 absolute inset-0 -m-8 animate-ping rounded-full border-4"
                            style={{ animationDelay: '0.5s' }}
                        ></div>
                        <div
                            className="border-primary/10 absolute inset-0 -m-12 animate-ping rounded-full border-4"
                            style={{ animationDelay: '1s' }}
                        ></div>
                    </div>

                    <div className="space-y-2 text-center">
                        <h3 className="text-foreground animate-pulse text-2xl font-bold">Selecting Winner...</h3>
                        <p className="text-muted-foreground text-sm">
                            Randomly choosing from {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                        </p>
                    </div>

                    {/* Animated loading bar */}
                    <div className="bg-primary/20 w-full max-w-xs overflow-hidden rounded-full">
                        <div className="animate-loading from-primary to-primary/50 h-2 rounded-full bg-gradient-to-r"></div>
                    </div>
                </div>

                <style>{`
                    @keyframes float {
                        0%, 100% {
                            transform: translate(0, 0) scale(1);
                            opacity: 0.3;
                        }
                        50% {
                            transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(1.5);
                            opacity: 0.8;
                        }
                    }

                    .animate-float {
                        animation: float ease-in-out infinite;
                    }

                    @keyframes loading {
                        0% {
                            width: 0%;
                        }
                        50% {
                            width: 100%;
                        }
                        100% {
                            width: 0%;
                        }
                    }

                    .animate-loading {
                        animation: loading 2s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    // Show participant count and admin controls
    return (
        <div className="border-primary/30 from-background to-primary/5 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gradient-to-br p-8">
            <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <Users className="h-10 w-10" />
            </div>

            <h3 className="text-foreground mb-2 text-2xl font-bold">
                {totalEntries} {totalEntries === 1 ? 'Entry' : 'Entries'}
            </h3>

            <p className="text-muted-foreground mb-6 text-center">
                {isAdmin && canSelectWinner ? 'Ready to select a winner' : 'Good luck to all participants!'}
            </p>

            {isAdmin && canSelectWinner && onSelectWinner && (
                <Button onClick={onSelectWinner} disabled={isSelecting} size="lg" className="mt-4">
                    {isSelecting ? (
                        <>
                            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Selecting Winner...
                        </>
                    ) : (
                        <>
                            <Gift className="mr-2 h-5 w-5" />
                            Select Winner
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
