import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Image as ImageIcon, Search, Trash2, Trophy, Upload, Users, XCircle } from 'lucide-react';
import { FormEventHandler, useMemo, useRef, useState } from 'react';

interface Image {
    id: number;
    name: string;
    url: string;
    is_primary: boolean;
    order: number;
}

interface Winner {
    id: number;
    name: string;
    phone: string;
    facebook_url: string;
}

interface Entry {
    id: number;
    name: string;
    phone: string;
    facebook_url: string;
    status: string;
    created_at: string;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'active' | 'ended';
    is_active: boolean;
    has_ended: boolean;
    can_accept_entries: boolean;
    winner_id: number | null;
    prize_claimed: boolean | null;
    prize_claimed_at: string | null;
    rejection_reason: string | null;
    winner: Winner | null;
    images: Image[];
    entries_count: number;
    entries: Entry[];
}

interface Props {
    giveaway: Giveaway;
}

export default function Edit({ giveaway }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: giveaway.title,
        description: giveaway.description,
        start_date: giveaway.start_date ? giveaway.start_date.slice(0, 16) : '',
        end_date: giveaway.end_date ? giveaway.end_date.slice(0, 16) : '',
        status: giveaway.status,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submittingClaim, setSubmittingClaim] = useState(false);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.giveaways.update', giveaway.slug));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        router.post(route('admin.giveaways.images.upload', giveaway.slug), formData, {
            onFinish: () => {
                setUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    const handleDeleteImage = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(route('admin.giveaways.images.delete', [giveaway.slug, imageId]));
        }
    };

    const handleSetPrimaryImage = (imageId: number) => {
        router.patch(route('admin.giveaways.images.set-primary', [giveaway.slug, imageId]));
    };

    const handleWinnerSelection = () => {
        router.visit(route('admin.giveaways.winner-selection', giveaway.slug));
    };

    const handleClaimPrize = () => {
        if (!confirm('Mark the prize as claimed? This confirms the winner has received their prize.')) {
            return;
        }

        setSubmittingClaim(true);
        router.post(
            route('admin.giveaways.claim-prize', giveaway.slug),
            {},
            {
                onFinish: () => setSubmittingClaim(false),
            },
        );
    };

    const handleRejectWinner = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason.');
            return;
        }

        setSubmittingClaim(true);
        router.post(
            route('admin.giveaways.reject-winner', giveaway.slug),
            { reason: rejectionReason },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                },
                onFinish: () => setSubmittingClaim(false),
            },
        );
    };

    // Filter entries based on search query (name only)
    const filteredEntries = useMemo(() => {
        if (!searchQuery.trim()) return giveaway.entries;
        return giveaway.entries.filter((entry) => entry.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery, giveaway.entries]);

    return (
        <AdminLayout>
            <Head title={`Edit Giveaway - ${giveaway.title}`} />

            <div className="container mx-auto max-w-5xl py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Edit Giveaway</h1>
                        <p className="text-muted-foreground">{giveaway.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {giveaway.entries_count > 0 && !giveaway.winner && (
                            <Button onClick={handleWinnerSelection}>
                                <Trophy className="mr-2 h-4 w-4" />
                                Select Winner
                            </Button>
                        )}
                        <Badge
                            className={
                                giveaway.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : giveaway.status === 'draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                            }
                        >
                            {giveaway.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-card rounded-lg border p-6">
                                <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Giveaway Title *</Label>
                                        <Input
                                            id="title"
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description / Criteria *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={6}
                                            className="mt-1"
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-lg border p-6">
                                <h2 className="mb-4 text-xl font-semibold">Schedule</h2>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="start_date">Start Date & Time *</Label>
                                        <Input
                                            id="start_date"
                                            type="datetime-local"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="end_date">End Date & Time *</Label>
                                        <Input
                                            id="end_date"
                                            type="datetime-local"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            min={data.start_date}
                                            className="mt-1"
                                        />
                                        <p className="text-muted-foreground mt-1 text-xs">Must be after the start date</p>
                                        {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-lg border p-6">
                                <h2 className="mb-4 text-xl font-semibold">Status</h2>

                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as 'draft' | 'active' | 'ended')}
                                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="ended">Ended</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => router.visit(route('admin.giveaways.index'))}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>

                        <div className="bg-card rounded-lg border p-6">
                            <h2 className="mb-4 text-xl font-semibold">Prize Images</h2>

                            <div className="space-y-4">
                                <div>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </Button>
                                </div>

                                {giveaway.images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {giveaway.images.map((image) => (
                                            <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                                                <img src={image.url} alt={image.name} className="aspect-square w-full object-cover" />
                                                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                                    {!image.is_primary && (
                                                        <Button size="sm" variant="secondary" onClick={() => handleSetPrimaryImage(image.id)}>
                                                            Set Primary
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteImage(image.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {image.is_primary && <Badge className="absolute top-2 left-2">Primary</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                        <ImageIcon className="text-muted-foreground mb-2 h-8 w-8" />
                                        <p className="text-muted-foreground text-sm">No images uploaded yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Entries List */}
                        {giveaway.entries_count > 0 && (
                            <div className="bg-card rounded-lg border p-6">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Entries ({giveaway.entries_count})</h2>
                                </div>
                                <div className="space-y-2">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                        <Input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    {filteredEntries.length === 0 && searchQuery && (
                                        <p className="text-muted-foreground py-4 text-center text-sm">No entries found matching "{searchQuery}"</p>
                                    )}
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted sticky top-0">
                                                <tr className="border-b">
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Phone</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Facebook</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredEntries.map((entry) => (
                                                    <tr key={entry.id} className="hover:bg-muted/50 border-b">
                                                        <td className="px-4 py-3 text-sm">
                                                            {entry.name}
                                                            {entry.id === giveaway.winner_id && (
                                                                <Badge className="ml-2 bg-yellow-100 text-yellow-800">Winner</Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{entry.phone}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <a
                                                                href={entry.facebook_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                View Profile
                                                            </a>
                                                        </td>
                                                        <td className="text-muted-foreground px-4 py-3 text-sm">
                                                            {new Date(entry.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-card rounded-lg border p-6">
                            <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Total Entries</span>
                                    <span className="font-semibold">{giveaway.entries_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Status</span>
                                    <Badge className={giveaway.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                        {giveaway.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {giveaway.winner && (
                            <div className="bg-card rounded-lg border p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                    Winner
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-muted-foreground text-sm">Name</p>
                                        <p className="font-medium">{giveaway.winner.name}</p>
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
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View Profile
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Prize Claim Verification */}
                        {giveaway.winner && (
                            <div className="bg-card rounded-lg border p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    {giveaway.prize_claimed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-orange-600" />
                                    )}
                                    Prize Claim Status
                                </h3>

                                {giveaway.prize_claimed ? (
                                    <div className="space-y-3">
                                        <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                            <p className="text-sm font-medium text-green-800">Prize Claimed Successfully</p>
                                            <p className="mt-1 text-xs text-green-600">
                                                Claimed on{' '}
                                                {new Date(giveaway.prize_claimed_at!).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                                            <p className="text-sm font-medium text-orange-800">Pending Prize Claim</p>
                                            <p className="mt-1 text-xs text-orange-600">
                                                Winner has been selected but prize has not been claimed yet.
                                            </p>
                                        </div>

                                        {giveaway.rejection_reason && (
                                            <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                                <p className="text-sm font-medium text-red-800">Previous Rejection</p>
                                                <p className="mt-1 text-xs text-red-600">{giveaway.rejection_reason}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <Button
                                                onClick={handleClaimPrize}
                                                disabled={submittingClaim}
                                                className="w-full bg-green-600 hover:bg-green-700 sm:flex-1"
                                            >
                                                {submittingClaim ? (
                                                    <>
                                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Prize Claimed
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                onClick={() => setShowRejectModal(true)}
                                                disabled={submittingClaim}
                                                variant="outline"
                                                className="w-full border-red-200 text-red-600 hover:bg-red-50 sm:flex-1"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                <span className="whitespace-nowrap">Reject & Pick New Winner</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reject Winner Modal */}
                        {showRejectModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                                    <h3 className="mb-4 text-lg font-semibold">Reject Winner & Select New</h3>

                                    <div className="mb-4">
                                        <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                                        <Textarea
                                            id="rejection_reason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="e.g., Didn't follow Facebook page, No response, Ineligible..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        <p className="text-muted-foreground mt-1 text-xs">This reason will be stored for record-keeping.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                setShowRejectModal(false);
                                                setRejectionReason('');
                                            }}
                                            variant="outline"
                                            className="flex-1"
                                            disabled={submittingClaim}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleRejectWinner}
                                            disabled={submittingClaim || !rejectionReason.trim()}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                        >
                                            {submittingClaim ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                'Reject & Select New Winner'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-card rounded-lg border p-6">
                            <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                            <div className="space-y-2">
                                {giveaway.entries_count > 0 && !giveaway.winner && (
                                    <Button className="w-full" onClick={handleWinnerSelection}>
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Select Winner
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full" onClick={() => window.open(`/giveaways/${giveaway.slug}`, '_blank')}>
                                    <Users className="mr-2 h-4 w-4" />
                                    View Public Page
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
