import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, UserCircle, Users } from 'lucide-react';

interface WinnerAnnouncementProps {
    totalEntries: number;
    winner?: string | null;
    winnerAnnounced?: boolean;
    isSelecting?: boolean;
    onSelectWinner?: () => void;
    canSelectWinner?: boolean;
    isAdmin?: boolean;
    entryNames?: string[];
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
    entryNames = [],
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

    // Selecting winner animation - show shuffling cards
    if (isSelecting) {
        // Show up to 9 participant cards during selection
        const displayNames = entryNames.length > 0 ? entryNames.slice(0, 9) : [];

        return (
            <div className="border-primary/50 relative overflow-hidden rounded-lg border-2 bg-gradient-to-br from-purple-50 to-white shadow-lg">
                {/* Header */}
                <div className="border-b bg-white/80 p-6 text-center backdrop-blur-sm">
                    <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <Gift className="h-8 w-8 animate-bounce" />
                    </div>
                    <h3 className="text-foreground mb-2 text-xl font-bold">Selecting Winner...</h3>
                    <p className="text-muted-foreground text-sm">
                        Randomly choosing from {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                    </p>
                </div>

                {/* Shuffling cards */}
                {displayNames.length > 0 && (
                    <div className="p-6">
                        <div className="grid grid-cols-3 gap-3">
                            {displayNames.map((name, index) => (
                                <div
                                    key={`${name}-${index}`}
                                    className="animate-shuffle flex flex-col items-center gap-2 rounded-lg border-2 border-purple-200 bg-white p-3 shadow-md"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50">
                                        <UserCircle className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="text-foreground text-center text-[10px] leading-tight font-medium">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress indicator */}
                <div className="border-t bg-white/80 px-6 py-4 backdrop-blur-sm">
                    <div className="h-2 overflow-hidden rounded-full bg-purple-100">
                        <div className="animate-progress from-primary to-primary/70 h-full rounded-full bg-gradient-to-r"></div>
                    </div>
                </div>

                <style>{`
                    @keyframes shuffle {
                        0%, 100% {
                            transform: translateY(0) scale(1);
                            opacity: 1;
                        }
                        25% {
                            transform: translateY(-8px) scale(1.05);
                            opacity: 0.8;
                        }
                        50% {
                            transform: translateY(0) scale(0.95);
                            opacity: 1;
                        }
                        75% {
                            transform: translateY(-4px) scale(1.02);
                            opacity: 0.9;
                        }
                    }

                    .animate-shuffle {
                        animation: shuffle 1.5s ease-in-out infinite;
                    }

                    @keyframes progress {
                        0% {
                            width: 0%;
                        }
                        100% {
                            width: 100%;
                        }
                    }

                    .animate-progress {
                        animation: progress 3s ease-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    // Show participant count and admin controls with rolling list
    return (
        <div className="border-primary/30 from-background to-primary/5 overflow-hidden rounded-lg border-2 border-dashed bg-gradient-to-br">
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center p-8 pb-4">
                <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                    <Users className="h-10 w-10" />
                </div>

                <h3 className="text-foreground mb-2 text-2xl font-bold">
                    {totalEntries} {totalEntries === 1 ? 'Entry' : 'Entries'}
                </h3>

                <p className="text-muted-foreground mb-4 text-center">
                    {isAdmin && canSelectWinner ? 'Ready to select a winner' : 'Good luck to all participants!'}
                </p>

                {isAdmin && canSelectWinner && onSelectWinner && (
                    <Button onClick={onSelectWinner} disabled={isSelecting} size="lg" className="mt-2">
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

            {/* Participants Cards Grid */}
            {entryNames.length > 0 && (
                <div className="border-t bg-gradient-to-b from-purple-50/30 to-white px-8 pt-6 pb-8">
                    <p className="text-muted-foreground mb-4 text-center text-sm font-medium">Current Participants</p>

                    {/* Grid of participant cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {entryNames.slice(0, 9).map((name, index) => (
                            <div
                                key={`${name}-${index}`}
                                className="group relative flex flex-col items-center gap-2 rounded-lg border border-purple-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-md"
                            >
                                {/* Participant icon */}
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50 transition-colors group-hover:from-purple-200 group-hover:to-purple-100">
                                    <UserCircle className="h-6 w-6 text-purple-600" />
                                </div>

                                {/* Participant name */}
                                <span className="text-foreground text-center text-xs leading-tight font-medium">{name}</span>

                                {/* Entry number badge */}
                                <Badge
                                    variant="outline"
                                    className="absolute top-2 right-2 h-5 border-purple-200 bg-purple-50 px-1.5 text-[10px] font-semibold text-purple-700"
                                >
                                    #{index + 1}
                                </Badge>
                            </div>
                        ))}
                    </div>

                    {/* Show count if more participants */}
                    {entryNames.length > 9 && (
                        <p className="text-muted-foreground mt-4 text-center text-xs">
                            + {entryNames.length - 9} more {entryNames.length - 9 === 1 ? 'participant' : 'participants'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
