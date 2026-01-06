import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, ImageIcon, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Entry {
    id: number;
    name: string;
    phone: string;
    facebook_url: string;
    status: string;
    entry_date: string;
    screenshot_url: string | null;
}

interface Winner {
    id: number;
    name: string;
    phone: string;
    facebook_url: string;
    entry_date?: string;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    status: string;
    number_of_winners: number;
    winner_id: number | null;
    winner: Winner | null;
    winners: Winner[];
    winners_count: number;
    entries: Entry[];
}

interface Props {
    giveaway: Giveaway;
}

export default function WinnerSelection({ giveaway }: Props) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [spinSpeed, setSpinSpeed] = useState(50);

    const handleSelectWinner = () => {
        if (giveaway.entries.length === 0) return;

        setIsSpinning(true);
        setSpinSpeed(50);
        let speed = 50;
        let iterations = 0;
        const maxIterations = 100;

        const spinInterval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % giveaway.entries.length);
            iterations++;

            // Slow down progressively
            if (iterations > maxIterations / 2) {
                speed += 5;
                setSpinSpeed(speed);
            }

            // Stop after maxIterations
            if (iterations >= maxIterations) {
                clearInterval(spinInterval);
                setTimeout(() => {
                    setIsSpinning(false);
                    // Actually select the winner via backend
                    router.post(
                        route('admin.giveaways.select-winner', giveaway.slug),
                        {},
                        {
                            preserveState: false,
                        },
                    );
                }, 500);
            }
        }, speed);
    };

    useEffect(() => {
        if (isSpinning) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % giveaway.entries.length);
            }, spinSpeed);
            return () => clearInterval(interval);
        }
    }, [isSpinning, spinSpeed, giveaway.entries.length]);

    const currentEntry = giveaway.entries[currentIndex];

    return (
        <AdminLayout>
            <Head title={`Winner Selection - ${giveaway.title}`} />

            <div className="container mx-auto max-w-4xl py-8">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => router.visit(route('admin.giveaways.edit', giveaway.slug))} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Giveaway
                    </Button>
                    <h1 className="text-3xl font-bold">Winner Selection</h1>
                    <p className="text-muted-foreground">{giveaway.title}</p>
                </div>

                {giveaway.winners_count >= giveaway.number_of_winners ? (
                    <div className="bg-card rounded-lg border p-8 text-center">
                        <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-600" />
                        <h2 className="mb-2 text-2xl font-bold">
                            {giveaway.number_of_winners > 1 ? `All ${giveaway.number_of_winners} Winners Selected` : 'Winner Already Selected'}
                        </h2>
                        <div className="bg-muted/50 mx-auto mt-6 max-w-2xl space-y-4 rounded-lg border p-6">
                            {giveaway.winners.map((winner, index) => (
                                <div key={winner.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="mb-2 flex items-center justify-center gap-2">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <p className="text-lg font-semibold">Winner {giveaway.number_of_winners > 1 ? `#${index + 1}` : ''}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-muted-foreground text-sm">Name</p>
                                            <p className="text-xl font-semibold">{winner.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Phone</p>
                                            <p className="font-medium">{winner.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-sm">Facebook</p>
                                            <a
                                                href={winner.facebook_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                View Profile
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : giveaway.entries.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Users className="text-muted-foreground mb-4 h-12 w-12" />
                        <h3 className="mb-2 text-lg font-semibold">No Entries Yet</h3>
                        <p className="text-muted-foreground text-sm">
                            There are no entries for this giveaway. Wait for participants to enter before selecting a winner.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-card rounded-lg border p-8">
                            <div className="mb-6 flex flex-col items-center justify-center gap-2 text-center">
                                <Badge variant="secondary" className="mb-1">
                                    <Users className="mr-1 h-3 w-3" />
                                    {giveaway.entries.length} Total Entries
                                </Badge>
                                {giveaway.number_of_winners > 1 && (
                                    <Badge variant={giveaway.winners_count > 0 ? 'default' : 'outline'}>
                                        <Trophy className="mr-1 h-3 w-3" />
                                        {giveaway.winners_count} / {giveaway.number_of_winners} Winners Selected
                                    </Badge>
                                )}
                            </div>

                            {/* Spinning Display */}
                            <div
                                className={`relative mx-auto mb-8 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-4 p-8 transition-all ${
                                    isSpinning
                                        ? 'animate-pulse border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
                                        : 'border-gray-200 bg-gray-50'
                                }`}
                            >
                                {currentEntry && (
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <Trophy
                                                className={`mx-auto h-16 w-16 ${isSpinning ? 'animate-bounce text-yellow-500' : 'text-gray-400'}`}
                                            />
                                        </div>
                                        <h3 className="mb-2 text-3xl font-bold">{currentEntry.name}</h3>
                                        <p className="text-muted-foreground text-lg">{currentEntry.phone}</p>
                                    </div>
                                )}

                                {isSpinning && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-shimmer h-full w-full rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <Button size="lg" onClick={handleSelectWinner} disabled={isSpinning} className="min-w-[200px]">
                                    {isSpinning ? (
                                        <>
                                            <span className="mr-2">Selecting...</span>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        </>
                                    ) : (
                                        <>
                                            <Trophy className="mr-2 h-4 w-4" />
                                            {giveaway.winners_count > 0
                                                ? `Select Remaining ${giveaway.number_of_winners - giveaway.winners_count} Winner${giveaway.number_of_winners - giveaway.winners_count > 1 ? 's' : ''}`
                                                : giveaway.number_of_winners > 1
                                                  ? `Select ${giveaway.number_of_winners} Winners`
                                                  : 'Select Random Winner'}
                                        </>
                                    )}
                                </Button>
                                {giveaway.winners_count > 0 && (
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        {giveaway.winners_count} winner{giveaway.winners_count > 1 ? 's' : ''} already selected
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="bg-card rounded-lg border p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">All Entries</h2>
                                <p className="text-muted-foreground text-xs">Rejected entries cannot be selected again</p>
                            </div>
                            <div className="max-h-[400px] space-y-2 overflow-y-auto">
                                {giveaway.entries.map((entry, index) => {
                                    const isWinner = entry.status === 'winner';
                                    const isRejected = entry.status === 'rejected';
                                    return (
                                        <div
                                            key={entry.id}
                                            className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                                isWinner
                                                    ? 'border-yellow-400 bg-yellow-50'
                                                    : isRejected
                                                      ? 'border-gray-300 bg-gray-100 opacity-60'
                                                      : currentIndex === index && isSpinning
                                                        ? 'border-purple-400 bg-purple-50'
                                                        : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex flex-1 items-center gap-2">
                                                {isWinner && <Trophy className="h-4 w-4 text-yellow-600" />}
                                                <div className="flex-1">
                                                    <p
                                                        className={`font-medium ${
                                                            isWinner ? 'text-yellow-900' : isRejected ? 'text-gray-500 line-through' : ''
                                                        }`}
                                                    >
                                                        {entry.name}
                                                    </p>
                                                    <p
                                                        className={`text-sm ${
                                                            isWinner ? 'text-yellow-700' : isRejected ? 'text-gray-400' : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {entry.phone}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <a
                                                            href={entry.facebook_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                                        >
                                                            Facebook Profile
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                        {entry.screenshot_url && (
                                                            <>
                                                                <span className="text-muted-foreground">•</span>
                                                                <a
                                                                    href={entry.screenshot_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                                                                >
                                                                    <ImageIcon className="h-3 w-3" />
                                                                    View Screenshot
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isWinner && (
                                                    <Badge variant="default" className="bg-yellow-600 text-xs">
                                                        Winner
                                                    </Badge>
                                                )}
                                                {isRejected && (
                                                    <Badge variant="outline" className="border-red-300 bg-red-50 text-xs text-red-700">
                                                        Rejected
                                                    </Badge>
                                                )}
                                                <Badge variant="outline" className="text-xs">
                                                    #{index + 1}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite;
                }
            `}</style>
        </AdminLayout>
    );
}
