import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Search, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Entry {
    id: number;
    name: string;
    created_at: string;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    primary_image_url: string | null;
    entries_count: number;
}

interface Props {
    giveaway: Giveaway;
    entries: Entry[];
}

export default function Entries({ giveaway, entries }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Filter entries based on search query (name only)
    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return entries;
        return entries.filter((entry) => entry.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, entries]);

    // Auto-scroll animation effect
    useEffect(() => {
        if (!scrollContainerRef.current || searchQuery.trim()) return;

        const container = scrollContainerRef.current;
        let animationFrame: number;
        const scrollSpeed = 0.5; // pixels per frame

        const animate = () => {
            if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
                // Reset to top when reaching bottom
                container.scrollTop = 0;
            } else {
                container.scrollTop += scrollSpeed;
            }
            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        // Pause on hover
        const handleMouseEnter = () => cancelAnimationFrame(animationFrame);
        const handleMouseLeave = () => {
            animationFrame = requestAnimationFrame(animate);
        };

        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationFrame);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [searchQuery]);

    return (
        <>
            <Head title={`Entries - ${giveaway.title}`} />
            <FloatingNav currentPage="giveaways" />

            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
                <div className="container mx-auto px-4 py-12">
                    {/* Back Link */}
                    <Link
                        href={`/giveaways/${giveaway.slug}`}
                        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Giveaway
                    </Link>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        {giveaway.primary_image_url && (
                            <div className="mb-6 flex justify-center">
                                <img
                                    src={giveaway.primary_image_url}
                                    alt={giveaway.title}
                                    className="h-32 w-32 rounded-full object-cover shadow-lg"
                                />
                            </div>
                        )}
                        <h1 className="mb-2 text-3xl font-bold">{giveaway.title}</h1>
                        <div className="text-muted-foreground flex items-center justify-center gap-2">
                            <Users className="h-5 w-5" />
                            <span>{giveaway.entries_count} Total Entries</span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mx-auto mb-6 max-w-md">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                type="text"
                                placeholder="Search entries by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {searchQuery && (
                            <p className="text-muted-foreground mt-2 text-center text-sm">
                                {filteredEntries.length === 0
                                    ? `No entries found matching "${searchQuery}"`
                                    : `Found ${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'}`}
                            </p>
                        )}
                    </div>

                    {/* Entries List */}
                    <Card className="mx-auto max-w-2xl">
                        <CardContent className="p-0">
                            {filteredEntries.length === 0 ? (
                                <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
                                    <Trophy className="text-muted-foreground mb-4 h-16 w-16" />
                                    <h3 className="mb-2 text-xl font-semibold">{searchQuery ? 'No Results' : 'No Entries Yet'}</h3>
                                    <p className="text-muted-foreground">
                                        {searchQuery ? 'Try a different search term' : 'Be the first to enter this giveaway!'}
                                    </p>
                                </div>
                            ) : (
                                <div
                                    ref={scrollContainerRef}
                                    className="max-h-[600px] overflow-y-auto"
                                    style={{ scrollBehavior: searchQuery ? 'auto' : 'smooth' }}
                                >
                                    <div className="divide-y">
                                        {filteredEntries.map((entry, index) => (
                                            <div
                                                key={entry.id}
                                                className="hover:bg-muted/50 flex items-center justify-between p-4 transition-colors"
                                                style={{
                                                    animation: searchQuery ? 'none' : `fadeIn 0.5s ease-in ${index * 0.05}s`,
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        #{entries.length - entries.indexOf(entry)}
                                                    </Badge>
                                                    <span className="font-medium">{entry.name}</span>
                                                </div>
                                                <span className="text-muted-foreground text-sm">
                                                    {formatDistanceToNow(new Date(entry.created_at), {
                                                        addSuffix: true,
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info */}
                    <div className="text-muted-foreground mt-6 text-center text-sm">
                        <p>Only participant names are shown for privacy</p>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}
