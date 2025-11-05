import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, Clock, Trophy, Users } from 'lucide-react';

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    can_accept_entries: boolean;
    entries_count: number;
    images: {
        id: number;
        url: string;
        is_primary: boolean;
        order: number;
    }[];
    primary_image_url: string | null;
}

interface Props {
    giveaways: Giveaway[];
}

function GiveawayCard({ giveaway }: { giveaway: Giveaway }) {
    const startDate = new Date(giveaway.start_date);
    const endDate = new Date(giveaway.end_date);
    const timeRemaining = giveaway.can_accept_entries
        ? formatDistanceToNow(endDate, { addSuffix: true })
        : formatDistanceToNow(startDate, { addSuffix: true });

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="aspect-video overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                {giveaway.primary_image_url ? (
                    <img
                        src={giveaway.primary_image_url}
                        alt={giveaway.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <Trophy className="h-20 w-20 text-purple-300" />
                    </div>
                )}
            </div>
            <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                    <Badge className={giveaway.can_accept_entries ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {giveaway.can_accept_entries ? 'Active Now' : 'Coming Soon'}
                    </Badge>
                    {giveaway.can_accept_entries ? (
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Ends {timeRemaining}</span>
                        </div>
                    ) : (
                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Starts {timeRemaining}</span>
                        </div>
                    )}
                </div>

                <h3 className="mb-2 text-xl font-bold">{giveaway.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">{giveaway.description}</p>

                <div className="text-muted-foreground mb-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{giveaway.entries_count} entries</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Ends {new Date(giveaway.end_date).toLocaleDateString()}</span>
                    </div>
                </div>

                <Link href={`/giveaways/${giveaway.slug}`}>
                    <Button className="w-full" disabled={!giveaway.can_accept_entries}>
                        {giveaway.can_accept_entries ? (
                            <>
                                <Trophy className="mr-2 h-4 w-4" />
                                Enter Giveaway
                            </>
                        ) : (
                            'Not Accepting Entries'
                        )}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}

export default function Index({ giveaways }: Props) {
    return (
        <>
            <Head title="Active Giveaways">
                <meta
                    name="description"
                    content="Enter our exciting giveaways for a chance to win amazing prizes! Follow the criteria and submit your entry today."
                />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Active Giveaways" />
                <meta
                    property="og:description"
                    content="Enter our exciting giveaways for a chance to win amazing prizes! Follow the criteria and submit your entry today."
                />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Active Giveaways" />
                <meta
                    name="twitter:description"
                    content="Enter our exciting giveaways for a chance to win amazing prizes! Follow the criteria and submit your entry today."
                />
            </Head>
            <FloatingNav currentPage="giveaways" />

            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
                <div className="container mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-purple-100 p-4">
                            <Trophy className="h-12 w-12 text-purple-600" />
                        </div>
                        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Active Giveaways</h1>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                            Enter our exciting giveaways for a chance to win amazing prizes! Follow the criteria and submit your entry today.
                        </p>
                    </div>

                    {/* Giveaways Grid */}
                    {giveaways.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                            <Trophy className="text-muted-foreground mb-4 h-16 w-16" />
                            <h3 className="mb-2 text-xl font-semibold">No Active Giveaways</h3>
                            <p className="text-muted-foreground">
                                There are no active giveaways at the moment. Check back soon for new opportunities!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {giveaways.map((giveaway) => (
                                <GiveawayCard key={giveaway.id} giveaway={giveaway} />
                            ))}
                        </div>
                    )}

                    {/* View Winners Link */}
                    <div className="mt-12 text-center">
                        <Link href="/giveaways/winners">
                            <Button variant="outline" size="lg">
                                <Trophy className="mr-2 h-4 w-4" />
                                View Past Winners
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
