import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Trophy, Users } from 'lucide-react';

interface Winner {
    name: string;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    end_date: string;
    winner: Winner;
    primary_image_url: string | null;
    entries_count: number;
}

interface Props {
    giveaways: Giveaway[];
}

function WinnerCard({ giveaway }: { giveaway: Giveaway }) {
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-yellow-100 to-orange-100">
                {giveaway.primary_image_url ? (
                    <img
                        src={giveaway.primary_image_url}
                        alt={giveaway.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Trophy className="h-20 w-20 text-yellow-300" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white shadow-lg">
                        <Trophy className="mr-1 h-3 w-3" />
                        Winner
                    </Badge>
                </div>
            </div>
            <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-bold">{giveaway.title}</h3>

                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">Winner</p>
                        <p className="font-semibold">{giveaway.winner.name}</p>
                    </div>
                </div>

                <div className="text-muted-foreground flex items-center gap-4 border-t pt-3 text-sm">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{giveaway.entries_count} entries</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Ended {formatDistanceToNow(new Date(giveaway.end_date), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function Winners({ giveaways }: Props) {
    return (
        <>
            <Head title="Giveaway Winners" />
            <FloatingNav currentPage="giveaways" />

            <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
                <div className="container mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-yellow-100 p-4">
                            <Trophy className="h-12 w-12 text-yellow-600" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Giveaway Winners</h1>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                            Congratulations to all our lucky winners! View the history of our completed giveaways and their champions.
                        </p>
                    </div>

                    {/* Winners Grid */}
                    {giveaways.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                            <Trophy className="text-muted-foreground mb-4 h-16 w-16" />
                            <h3 className="mb-2 text-xl font-semibold">No Winners Yet</h3>
                            <p className="text-muted-foreground mb-4">No giveaways have been completed yet. Check back soon!</p>
                            <Link href="/giveaways">
                                <Button>View Active Giveaways</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {giveaways.map((giveaway) => (
                                    <WinnerCard key={giveaway.id} giveaway={giveaway} />
                                ))}
                            </div>

                            {/* CTA */}
                            <div className="mt-12 text-center">
                                <Link href="/giveaways">
                                    <Button size="lg">
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Enter Current Giveaways
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
