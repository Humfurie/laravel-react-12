import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, ArrowUpRight, Calendar, Clock, Gift, Sparkles, Trophy, Users } from 'lucide-react';
import { memo } from 'react';

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

// Featured Giveaway Card (Large)
const FeaturedGiveawayCard = memo(function FeaturedGiveawayCard({ giveaway }: { giveaway: Giveaway }) {
    const endDate = new Date(giveaway.end_date);
    formatDistanceToNow(endDate, { addSuffix: false });

    return (
        <article className="group cursor-pointer lg:col-span-2">
            <Link href={`/giveaways/${giveaway.slug}`}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-[#F5E6D3] dark:bg-gray-800">
                    {giveaway.primary_image_url ? (
                        <img
                            src={giveaway.primary_image_url}
                            alt={giveaway.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                            <Trophy className="h-24 w-24 text-orange-300" />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-6 left-6">
                        <Badge
                            className={`rounded-full px-4 py-2 text-xs font-medium shadow-sm ${giveaway.can_accept_entries ? 'border-0 bg-green-500 text-white' : 'border-0 bg-blue-500 text-white'}`}
                        >
                            {giveaway.can_accept_entries ? 'Active Now' : 'Coming Soon'}
                        </Badge>
                    </div>

                    {/* Featured Badge */}
                    <div className="absolute top-6 right-6">
                        <Badge className="rounded-full border-0 bg-[#F97316] px-4 py-1.5 text-white">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Featured
                        </Badge>
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                        <h2 className="mb-2 line-clamp-2 text-2xl font-bold text-white md:text-3xl">{giveaway.title}</h2>
                        <p className="line-clamp-2 max-w-xl text-sm text-white/80 md:text-base">{giveaway.description}</p>
                    </div>

                    {/* Entries Count */}
                    <div className="absolute bottom-6 left-6 flex items-center gap-1 text-xs text-white/70">
                        <Users className="h-3 w-3" />
                        {giveaway.entries_count} entries
                    </div>

                    {/* Arrow Link */}
                    <div className="absolute right-6 bottom-6 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110">
                        <ArrowUpRight className="h-5 w-5 text-gray-900" />
                    </div>
                </div>
            </Link>
        </article>
    );
});

// Regular Giveaway Card
const GiveawayCard = memo(function GiveawayCard({ giveaway, isLarge = false }: { giveaway: Giveaway; isLarge?: boolean }) {
    const startDate = new Date(giveaway.start_date);
    const endDate = new Date(giveaway.end_date);
    const timeRemaining = giveaway.can_accept_entries
        ? formatDistanceToNow(endDate, { addSuffix: true })
        : formatDistanceToNow(startDate, { addSuffix: true });

    return (
        <article className={`group cursor-pointer ${isLarge ? 'md:col-span-2' : ''}`}>
            <Link href={`/giveaways/${giveaway.slug}`}>
                {/* Image Container */}
                <div className={`relative overflow-hidden rounded-2xl bg-[#F5F5F3] dark:bg-gray-800 ${isLarge ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
                    {giveaway.primary_image_url ? (
                        <img
                            src={giveaway.primary_image_url}
                            alt={giveaway.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                            <Trophy className="h-16 w-16 text-orange-200 dark:text-orange-700" />
                        </div>
                    )}

                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-700 dark:text-gray-200">
                        {new Date(giveaway.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Entries Count */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        <Users className="h-3 w-3" />
                        {giveaway.entries_count}
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all group-hover:opacity-100">
                        <ArrowUpRight className="h-4 w-4 text-gray-900" />
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2">
                        <Badge
                            className={`rounded-full text-xs ${giveaway.can_accept_entries ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                        >
                            {giveaway.can_accept_entries ? 'Active' : 'Coming Soon'}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {giveaway.can_accept_entries ? `Ends ${timeRemaining}` : `Starts ${timeRemaining}`}
                        </span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                        {giveaway.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{giveaway.description}</p>

                    {/* Meta Info */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ends {new Date(giveaway.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {giveaway.entries_count} entries
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
});

export default function Index({ giveaways }: Props) {
    const featuredGiveaway = giveaways.find((g) => g.can_accept_entries) || giveaways[0];
    const otherGiveaways = giveaways.filter((g) => g.id !== featuredGiveaway?.id);

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

            <div className="min-h-screen bg-[#FAFAF8] dark:bg-gray-900">
                <FloatingNav currentPage="giveaways" />

                <main className="pt-20">
                    {/* Magazine Hero Section */}
                    <section className="container mx-auto px-4 py-8 md:py-12">
                        {/* Section Header */}
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl dark:text-white">
                                    Active
                                    <br />
                                    <span className="relative text-orange-500 dark:text-orange-400">
                                        giveaways
                                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                                            <path
                                                d="M1 5.5C47.5 2 154.5 1 199 5.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                className="text-orange-300 dark:text-orange-600"
                                            />
                                        </svg>
                                    </span>
                                </h1>
                            </div>
                            <Link
                                href="/giveaways/winners"
                                className="hidden items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 md:flex dark:text-gray-400 dark:hover:text-white"
                            >
                                View past winners
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {/* Featured Grid - Magazine Layout */}
                        {giveaways.length > 0 ? (
                            <div className="grid gap-6 lg:grid-cols-3">
                                {/* Main Featured Card */}
                                {featuredGiveaway && <FeaturedGiveawayCard giveaway={featuredGiveaway} />}

                                {/* Sidebar Cards */}
                                <div className="flex flex-col gap-6">
                                    {/* Info Card */}
                                    <div className="flex flex-col justify-between rounded-3xl bg-[#FED7AA] p-6 dark:bg-orange-900/30">
                                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                                            <Gift className="h-4 w-4" />
                                            <span>GIVEAWAYS</span>
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Win amazing</p>
                                            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                                Prizes &
                                                <br />
                                                Rewards
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Enter our exciting giveaways for a chance to win!
                                            </p>
                                        </div>
                                        <div className="mt-6 font-serif text-3xl font-bold text-gray-900 dark:text-white">
                                            {giveaways.length} active
                                        </div>
                                    </div>

                                    {/* Second Giveaway Post */}
                                    {otherGiveaways[0] && (
                                        <Link href={`/giveaways/${otherGiveaways[0].slug}`}>
                                            <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-3xl">
                                                {otherGiveaways[0].primary_image_url ? (
                                                    <img
                                                        src={otherGiveaways[0].primary_image_url}
                                                        alt={otherGiveaways[0].title}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                                                        <Trophy className="h-16 w-16 text-orange-300" />
                                                    </div>
                                                )}

                                                {/* Entries count */}
                                                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                                                    <Users className="h-3 w-3" />
                                                    {otherGiveaways[0].entries_count}
                                                </div>

                                                <div className="absolute right-4 bottom-4 left-4">
                                                    <h3 className="line-clamp-2 text-lg font-bold text-white drop-shadow-lg">
                                                        {otherGiveaways[0].title}
                                                    </h3>
                                                </div>

                                                {/* Arrow */}
                                                <div className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100">
                                                    <ArrowUpRight className="h-4 w-4 text-gray-900" />
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                                <Trophy className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No Active Giveaways</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    There are no active giveaways at the moment. Check back soon for new opportunities!
                                </p>
                            </div>
                        )}
                    </section>

                    {/* All Giveaways Section */}
                    {otherGiveaways.length > 1 && (
                        <section id="all-giveaways" className="container mx-auto px-4 py-8 md:py-12">
                            {/* Section Header */}
                            <div className="mb-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                    <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">All Giveaways</h2>
                                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                                </div>
                                <p className="mt-4 text-center text-gray-500 dark:text-gray-400">Browse through {giveaways.length} giveaways</p>
                            </div>

                            {/* Giveaways Grid */}
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {otherGiveaways.slice(1).map((giveaway, index) => (
                                    <GiveawayCard key={giveaway.id} giveaway={giveaway} isLarge={index === 0} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* View Winners CTA */}
                    <section className="container mx-auto px-4 py-12">
                        <div className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center text-white md:p-12">
                            <h2 className="mb-4 text-2xl font-bold md:text-3xl">Check out our past winners!</h2>
                            <p className="mx-auto mb-6 max-w-lg text-white/80">
                                See who won in previous giveaways and get inspired to participate in our upcoming events.
                            </p>
                            <Link href="/giveaways/winners">
                                <Button variant="secondary" size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                                    <Trophy className="mr-2 h-4 w-4" />
                                    View Past Winners
                                </Button>
                            </Link>
                        </div>
                    </section>
                </main>
            </div>

            <Footer />
        </>
    );
}
