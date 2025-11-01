import AdBanner from '@/components/ads/AdBanner';
import FloatingNav from '@/components/floating-nav';
import WinnerAnnouncement from '@/components/giveaway/WinnerAnnouncement';
import Footer from '@/components/global/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Calendar, CheckCircle2, Clock, Trophy, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Image {
    id: number;
    url: string;
    is_primary: boolean;
    order: number;
}

interface Winner {
    name: string;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    is_active: boolean;
    has_ended: boolean;
    can_accept_entries: boolean;
    can_start_giveaway: boolean;
    entries_count: number;
    winner: Winner | null;
    entry_names: string[];
    images: Image[];
    primary_image_url: string | null;
}

interface Props {
    giveaway: Giveaway;
}

interface GiveawayPageProps {
    giveaway: Giveaway;
    auth?: {
        isAdmin?: boolean;
        permissions?: {
            giveaway?: {
                viewAny?: boolean;
                view?: boolean;
                create?: boolean;
                update?: boolean;
                delete?: boolean;
            };
            [key: string]: unknown;
        };
    };
    adsense?: {
        client_id?: string;
        enabled?: boolean;
        slots?: {
            raffle_top?: string;
            raffle_sidebar?: string;
        };
    };
    [key: string]: unknown;
}

export default function Show({ giveaway }: Props) {
    const { props } = usePage<GiveawayPageProps>();
    const adsense = props.adsense;
    // Check if user has giveaway update permission (wildcard * or specific update)
    const canManageGiveaway = props.auth?.permissions?.giveaway?.update ?? false;

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        facebook_url: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [startingRaffle, setStartingRaffle] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showGrandReveal, setShowGrandReveal] = useState(false);

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        try {
            const response = await axios.post(`/api/v1/giveaways/${giveaway.slug}/enter`, formData);

            if (response.data.success) {
                setSuccess(true);
                setFormData({ name: '', phone: '', facebook_url: '' });
            }
        } catch (error: unknown) {
            if (error instanceof Error && 'response' in error) {
                const axiosError = error as { response?: { data?: { errors?: Record<string, string>; message?: string } } };
                if (axiosError.response?.data?.errors) {
                    setErrors(axiosError.response.data.errors);
                } else if (axiosError.response?.data?.message) {
                    setErrors({ general: axiosError.response.data.message });
                } else {
                    setErrors({ general: 'Failed to submit entry. Please try again.' });
                }
            } else {
                setErrors({ general: 'Failed to submit entry. Please try again.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handlePickWinner = () => {
        // Don't show confirmation if already started
        if (startingRaffle || isSpinning) {
            return;
        }

        setStartingRaffle(true);
        setIsSpinning(true);

        // Simulate spinning for at least 5 seconds for dramatic effect
        const minSpinTime = 5000;
        const startTime = Date.now();

        router.post(
            `/giveaways/${giveaway.slug}/pick-winner`,
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    // Ensure minimum spin time for dramatic effect
                    const elapsed = Date.now() - startTime;
                    const remainingTime = Math.max(0, minSpinTime - elapsed);

                    setTimeout(() => {
                        setIsSpinning(false);
                        setStartingRaffle(false);

                        // Show grand reveal after spinning completes
                        setTimeout(() => {
                            setShowGrandReveal(true);
                        }, 500);
                    }, remainingTime);
                },
            },
        );
    };

    const endDate = new Date(giveaway.end_date);
    const startDate = new Date(giveaway.start_date);
    const timeRemaining = giveaway.is_active
        ? formatDistanceToNow(endDate, { addSuffix: true })
        : formatDistanceToNow(startDate, { addSuffix: true });

    return (
        <>
            <Head title={giveaway.title} />
            <FloatingNav currentPage="giveaways" />

            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
                <div className="container mx-auto px-4 py-12">
                    {/* Back Link */}
                    <Button variant="ghost" onClick={() => router.visit('/giveaways')} className="mb-6">
                        ← Back to Giveaways
                    </Button>

                    {/* Top Banner Ad */}
                    <AdBanner
                        adClient={adsense?.client_id}
                        adSlot={adsense?.slots?.raffle_top}
                        adFormat="horizontal"
                        testMode={!adsense?.enabled}
                        className="mb-6"
                    />

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Hero Image */}
                            <div className="overflow-hidden rounded-lg">
                                {giveaway.primary_image_url ? (
                                    <img src={giveaway.primary_image_url} alt={giveaway.title} className="aspect-video w-full object-cover" />
                                ) : (
                                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                                        <Trophy className="h-24 w-24 text-purple-300" />
                                    </div>
                                )}
                            </div>

                            {/* Gallery */}
                            {giveaway.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {giveaway.images.map((image) => (
                                        <img key={image.id} src={image.url} alt="Prize" className="aspect-square rounded-md object-cover" />
                                    ))}
                                </div>
                            )}

                            {/* Title & Description */}
                            <div>
                                <div className="mb-4 flex items-center gap-2">
                                    <h1 className="text-4xl font-bold">{giveaway.title}</h1>
                                    {giveaway.is_active && <Badge className="bg-green-100 text-green-800">Active</Badge>}
                                    {giveaway.has_ended && <Badge className="bg-gray-100 text-gray-800">Ended</Badge>}
                                </div>

                                <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={() => router.visit(`/giveaways/${giveaway.slug}/entries`)}
                                        className="hover:text-foreground flex items-center gap-2 transition-colors"
                                    >
                                        <Users className="h-5 w-5" />
                                        <span className="underline">{giveaway.entries_count} entries</span>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        <span>
                                            {new Date(giveaway.start_date).toLocaleDateString()} - {new Date(giveaway.end_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {giveaway.is_active && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5" />
                                            <span>Ends {timeRemaining}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="prose max-w-none">
                                    <h2 className="mb-3 text-2xl font-semibold">How to Enter</h2>
                                    <div className="text-muted-foreground whitespace-pre-wrap">{giveaway.description}</div>
                                </div>

                                {/* Legal Disclaimer */}
                                <Card className="border-blue-200 bg-blue-50/50">
                                    <CardContent className="p-4">
                                        <p className="text-center text-sm font-semibold text-blue-900">⚠️ NO PURCHASE NECESSARY</p>
                                        <p className="mt-2 text-center text-xs text-blue-700">
                                            This is a FREE promotional giveaway. Entry is completely free and no payment is required. Winner will be
                                            selected randomly from all eligible entries. Void where prohibited.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Winner Announcement */}
                            {giveaway.winner && (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Trophy className="h-8 w-8 flex-shrink-0 text-yellow-600" />
                                            <div>
                                                <h3 className="mb-2 text-xl font-semibold">Winner Announced!</h3>
                                                <p className="text-lg">
                                                    Congratulations to <span className="font-bold">{giveaway.winner.name}</span>!
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Winner Selection Animation */}
                            {giveaway.entries_count > 0 && (
                                <div>
                                    <WinnerAnnouncement
                                        totalEntries={giveaway.entries_count}
                                        winner={giveaway.winner?.name}
                                        winnerAnnounced={!!giveaway.winner && !showGrandReveal}
                                        isSelecting={isSpinning}
                                        onSelectWinner={handlePickWinner}
                                        canSelectWinner={canManageGiveaway && giveaway.can_start_giveaway}
                                        isAdmin={canManageGiveaway}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Entry Form and Ads */}
                        <div className="space-y-6 lg:col-span-1">
                            {/* Sidebar Ad */}
                            <AdBanner
                                adClient={adsense?.client_id}
                                adSlot={adsense?.slots?.raffle_sidebar}
                                adFormat="rectangle"
                                testMode={!adsense?.enabled}
                                style={{ minHeight: '250px' }}
                            />

                            <div className="sticky top-6">
                                <Card>
                                    <CardContent className="p-6">
                                        {success ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                                                <h3 className="mb-2 text-xl font-semibold">Entry Submitted!</h3>
                                                <p className="text-muted-foreground mb-4 text-sm">
                                                    Your entry has been successfully submitted. Good luck!
                                                </p>
                                                <Button variant="outline" onClick={() => router.visit('/giveaways')} className="w-full">
                                                    View Other Giveaways
                                                </Button>
                                            </div>
                                        ) : giveaway.can_accept_entries ? (
                                            <>
                                                <h3 className="mb-4 text-xl font-semibold">Enter This Giveaway</h3>

                                                <form onSubmit={handleSubmit} className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="name">Full Name *</Label>
                                                        <Input
                                                            id="name"
                                                            type="text"
                                                            value={formData.name}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    name: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Juan Dela Cruz"
                                                            className="mt-1"
                                                            required
                                                        />
                                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="phone">Phone Number *</Label>
                                                        <Input
                                                            id="phone"
                                                            type="tel"
                                                            value={formData.phone}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    phone: e.target.value,
                                                                })
                                                            }
                                                            placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                                                            pattern="^(\+639|09)\d{9}$"
                                                            className="mt-1"
                                                            required
                                                        />
                                                        <p className="text-muted-foreground mt-1 text-xs">
                                                            Format: 09XXXXXXXXX or +639XXXXXXXXX (must be unique per giveaway)
                                                        </p>
                                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="facebook_url">Facebook Profile URL *</Label>
                                                        <Input
                                                            id="facebook_url"
                                                            type="url"
                                                            value={formData.facebook_url}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    facebook_url: e.target.value,
                                                                })
                                                            }
                                                            placeholder="https://facebook.com/yourprofile"
                                                            className="mt-1"
                                                            required
                                                        />
                                                        <p className="text-muted-foreground mt-1 text-xs">
                                                            Make sure you've followed the required Facebook page
                                                        </p>
                                                        {errors.facebook_url && <p className="mt-1 text-sm text-red-600">{errors.facebook_url}</p>}
                                                    </div>

                                                    {errors.general && (
                                                        <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                                                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                                            <p>{errors.general}</p>
                                                        </div>
                                                    )}

                                                    <Button type="submit" className="w-full" disabled={submitting}>
                                                        {submitting ? (
                                                            <>
                                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trophy className="mr-2 h-4 w-4" />
                                                                Submit Entry
                                                            </>
                                                        )}
                                                    </Button>
                                                </form>
                                            </>
                                        ) : giveaway.has_ended ? (
                                            <div className="text-center">
                                                <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                                <h3 className="mb-2 text-xl font-semibold">Giveaway Ended</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    This giveaway has ended and is no longer accepting entries.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                                <h3 className="mb-2 text-xl font-semibold">Coming Soon</h3>
                                                <p className="text-muted-foreground text-sm">This giveaway starts {timeRemaining}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grand Winner Reveal Modal */}
            {showGrandReveal && giveaway.winner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl p-8 text-center">
                        {/* Fireworks/Confetti Effect */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            {[...Array(100)].map((_, i) => (
                                <div
                                    key={i}
                                    className="animate-firework absolute"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${2 + Math.random() * 3}s`,
                                    }}
                                >
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{
                                            backgroundColor: ['#fbbf24', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6', '#10b981'][
                                                Math.floor(Math.random() * 6)
                                            ],
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className="relative z-10 space-y-8">
                            {/* Trophy with glow rings */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    <Trophy className="h-32 w-32 animate-bounce text-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,1)]" />
                                    <div className="absolute inset-0 -m-8 animate-ping rounded-full border-8 border-yellow-400/30"></div>
                                    <div
                                        className="absolute inset-0 -m-16 animate-ping rounded-full border-8 border-yellow-400/20"
                                        style={{ animationDelay: '0.5s' }}
                                    ></div>
                                    <div
                                        className="absolute inset-0 -m-24 animate-ping rounded-full border-8 border-yellow-400/10"
                                        style={{ animationDelay: '1s' }}
                                    ></div>
                                </div>
                            </div>

                            {/* Animated "Winner!" text */}
                            <div className="space-y-4">
                                <h1 className="animate-pulse text-8xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
                                    🎉 WINNER! 🎉
                                </h1>
                            </div>

                            {/* Winner Name - BIG */}
                            <div className="animate-pulse rounded-2xl border-4 border-yellow-400 bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 p-12 shadow-2xl backdrop-blur-sm">
                                <p className="mb-4 text-3xl font-semibold tracking-wider text-yellow-300 uppercase">Congratulations to</p>
                                <h2 className="animate-bounce text-9xl font-black text-yellow-400 drop-shadow-[0_0_60px_rgba(250,204,21,1)]">
                                    {giveaway.winner.name}
                                </h2>
                            </div>

                            {/* Decorative elements */}
                            <div className="flex items-center justify-center gap-8 text-6xl">
                                <span className="animate-spin-slow">⭐</span>
                                <span className="animate-bounce">🎊</span>
                                <span className="animate-pulse">🏆</span>
                                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
                                    🎊
                                </span>
                                <span className="animate-spin-slow" style={{ animationDelay: '1s' }}>
                                    ⭐
                                </span>
                            </div>

                            {/* Close button */}
                            <Button
                                onClick={() => setShowGrandReveal(false)}
                                size="lg"
                                className="mt-8 bg-yellow-500 px-12 py-6 text-xl font-bold text-black hover:bg-yellow-600"
                            >
                                Close Celebration
                            </Button>
                        </div>

                        <style>{`
                            @keyframes firework {
                                0% {
                                    transform: translate(0, 0) scale(0);
                                    opacity: 1;
                                }
                                50% {
                                    opacity: 1;
                                }
                                100% {
                                    transform: translate(
                                        ${Math.random() * 200 - 100}px,
                                        ${Math.random() * 200 - 100}px
                                    ) scale(1);
                                    opacity: 0;
                                }
                            }

                            .animate-firework {
                                animation: firework ease-out infinite;
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
                </div>
            )}

            <Footer />
        </>
    );
}
