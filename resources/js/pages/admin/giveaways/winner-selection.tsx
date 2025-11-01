import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Entry {
    id: number;
    name: string;
    phone: string;
    facebook_url: string;
    status: string;
    entry_date: string;
}

interface Winner {
    id: number;
    name: string;
    phone: string;
    facebook_url: string;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    status: string;
    winner_id: number | null;
    winner: Winner | null;
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
                        Back to Raffle
                    </Button>
                    <h1 className="text-3xl font-bold">Winner Selection</h1>
                    <p className="text-muted-foreground">{giveaway.title}</p>
                </div>

                {giveaway.winner ? (
                    <div className="bg-card rounded-lg border p-8 text-center">
                        <Trophy className="mx-auto mb-4 h-16 w-16 text-yellow-600" />
                        <h2 className="mb-2 text-2xl font-bold">Winner Already Selected</h2>
                        <div className="bg-muted/50 mx-auto mt-6 max-w-md space-y-4 rounded-lg border p-6">
                            <div>
                                <p className="text-muted-foreground text-sm">Name</p>
                                <p className="text-xl font-semibold">{giveaway.winner.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Phone</p>
                                <p className="font-medium">{giveaway.winner.phone}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">Facebook</p>
                                <a
                                    href={giveaway.winner.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    View Profile
                                </a>
                            </div>
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
                            <div className="mb-6 text-center">
                                <Badge variant="secondary" className="mb-2">
                                    <Users className="mr-1 h-3 w-3" />
                                    {giveaway.entries.length} Total Entries
                                </Badge>
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
                                            Select Random Winner
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Entries List */}
                        <div className="bg-card rounded-lg border p-6">
                            <h2 className="mb-4 text-xl font-semibold">All Entries</h2>
                            <div className="max-h-[400px] space-y-2 overflow-y-auto">
                                {giveaway.entries.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                                            currentIndex === index && isSpinning ? 'border-yellow-400 bg-yellow-50' : 'bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-medium">{entry.name}</p>
                                            <p className="text-muted-foreground text-sm">{entry.phone}</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            #{index + 1}
                                        </Badge>
                                    </div>
                                ))}
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
