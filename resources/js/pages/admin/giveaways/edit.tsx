import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, ExternalLink, Image as ImageIcon, Search, Trash2, Trophy, Upload, Users, XCircle } from 'lucide-react';
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
    screenshot_url: string | null;
}

interface Giveaway {
    id: number;
    title: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    number_of_winners: number;
    background_image?: string | null;
    background_image_url?: string | null;
    status: 'draft' | 'active' | 'ended';
    is_active: boolean;
    has_ended: boolean;
    can_accept_entries: boolean;
    winner_id: number | null;
    prize_claimed: boolean | null;
    prize_claimed_at: string | null;
    rejection_reason: string | null;
    winner: Winner | null;
    winners?: Winner[];
    images: Image[];
    entries_count: number;
    entries: Entry[];
}

interface Props {
    giveaway: Giveaway;
}

export default function Edit({ giveaway }: Props) {
    // Convert dates to local datetime for datetime-local input
    const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format to YYYY-MM-DDTHH:mm in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { data, setData, put, processing, errors } = useForm({
        title: giveaway.title,
        description: giveaway.description,
        start_date: formatDateForInput(giveaway.start_date),
        end_date: formatDateForInput(giveaway.end_date),
        number_of_winners: giveaway.number_of_winners || 1,
        status: giveaway.status,
    });

    const [hasEndDate, setHasEndDate] = useState(!!giveaway.end_date);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingBackground, setUploadingBackground] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submittingClaim, setSubmittingClaim] = useState(false);
    const [winnerToReject, setWinnerToReject] = useState<number | null>(null);

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

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('background', file);

        setUploadingBackground(true);
        router.post(route('admin.giveaways.background.upload', giveaway.slug), formData, {
            onFinish: () => {
                setUploadingBackground(false);
                if (backgroundInputRef.current) {
                    backgroundInputRef.current.value = '';
                }
            },
        });
    };

    const handleDeleteBackground = () => {
        if (confirm('Are you sure you want to remove the background image?')) {
            router.delete(route('admin.giveaways.background.delete', giveaway.slug));
        }
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

        if (!winnerToReject) {
            alert('No winner selected to reject.');
            return;
        }

        setSubmittingClaim(true);
        router.post(
            route('admin.giveaways.reject-winner', giveaway.slug),
            { reason: rejectionReason, winner_id: winnerToReject },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setWinnerToReject(null);
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
                        {giveaway.entries_count > 0 && (giveaway.winners?.length || 0) < giveaway.number_of_winners && (
                            <Button onClick={handleWinnerSelection}>
                                <Trophy className="mr-2 h-4 w-4" />
                                Select {(giveaway.winners?.length || 0) === 0 ? 'Winner' : 'Next Winner'} ({(giveaway.winners?.length || 0) + 1}/
                                {giveaway.number_of_winners})
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
                                        <div className="mb-2 flex items-center space-x-3">
                                            <Checkbox
                                                id="has_end_date"
                                                checked={hasEndDate}
                                                onCheckedChange={(checked: boolean) => {
                                                    const isChecked = checked as boolean;
                                                    setHasEndDate(isChecked);
                                                    if (!isChecked) {
                                                        setData('end_date', '');
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="has_end_date" className="cursor-pointer">
                                                Set end date (uncheck for unlimited duration)
                                            </Label>
                                        </div>
                                        <Label htmlFor="end_date">End Date & Time</Label>
                                        <Input
                                            id="end_date"
                                            type="datetime-local"
                                            value={data.end_date || ''}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            min={data.start_date}
                                            className="mt-1"
                                            disabled={!hasEndDate}
                                        />
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {hasEndDate
                                                ? 'Must be after the start date'
                                                : 'Unlimited duration - giveaway ends only when winner is picked'}
                                        </p>
                                        {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-lg border p-6">
                                <h2 className="mb-4 text-xl font-semibold">Winners Configuration</h2>

                                <div>
                                    <Label htmlFor="number_of_winners">Number of Winners *</Label>
                                    <Input
                                        id="number_of_winners"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={data.number_of_winners}
                                        onChange={(e) => setData('number_of_winners', parseInt(e.target.value) || 1)}
                                        className="mt-1"
                                    />
                                    <p className="text-muted-foreground mt-1 text-xs">How many winners will be selected from the entries (1-100)</p>
                                    {errors.number_of_winners && <p className="mt-1 text-sm text-red-600">{errors.number_of_winners}</p>}
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

                        <div className="bg-card rounded-lg border p-6">
                            <h2 className="mb-4 text-xl font-semibold">Page Background Image</h2>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Upload a custom background image for the public giveaway page. Great for themed giveaways (e.g., Christmas, Halloween)
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <input
                                        ref={backgroundInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBackgroundUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => backgroundInputRef.current?.click()}
                                        disabled={uploadingBackground}
                                        className="w-full"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {uploadingBackground ? 'Uploading...' : 'Upload Background Image'}
                                    </Button>
                                </div>

                                {giveaway.background_image_url ? (
                                    <div className="group relative overflow-hidden rounded-lg border">
                                        <img src={giveaway.background_image_url} alt="Background" className="h-48 w-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button size="sm" variant="destructive" onClick={handleDeleteBackground}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove
                                            </Button>
                                        </div>
                                        <Badge className="absolute top-2 left-2 bg-purple-600">Background Image</Badge>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                                        <ImageIcon className="text-muted-foreground mb-2 h-8 w-8" />
                                        <p className="text-muted-foreground text-sm">No background image uploaded</p>
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
                                                    <th className="px-4 py-2 text-left text-sm font-medium">Screenshot</th>
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
                                                                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                            >
                                                                View Profile
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {entry.screenshot_url ? (
                                                                <a
                                                                    href={entry.screenshot_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-green-600 hover:underline"
                                                                >
                                                                    <ImageIcon className="h-4 w-4" />
                                                                    View
                                                                </a>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">No screenshot</span>
                                                            )}
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
                                    <span className="text-muted-foreground text-sm">Winners Selected</span>
                                    <span className="font-semibold">
                                        {giveaway.winners?.length || 0} / {giveaway.number_of_winners}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Status</span>
                                    <Badge className={giveaway.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                        {giveaway.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {giveaway.winners && giveaway.winners.length > 0 && (
                            <div className="bg-card rounded-lg border p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                    {giveaway.number_of_winners === 1 ? 'Winner Selected' : `All ${giveaway.winners.length} Winners Selected`}
                                </h3>
                                <div className="space-y-4">
                                    {giveaway.winners.map((winner, index) => (
                                        <div key={winner.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50/50 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Trophy className="h-5 w-5 text-yellow-600" />
                                                    <Badge className="bg-yellow-600 hover:bg-yellow-700">
                                                        Winner {giveaway.number_of_winners > 1 ? `#${index + 1}` : ''}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="mb-4 space-y-2">
                                                <div>
                                                    <p className="text-muted-foreground text-xs font-medium">Name</p>
                                                    <p className="text-lg font-semibold">{winner.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs font-medium">Phone</p>
                                                    <p className="font-medium">{winner.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs font-medium">Facebook</p>
                                                    <a
                                                        href={winner.facebook_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        View Profile →
                                                    </a>
                                                </div>
                                            </div>

                                            {/* Winner Actions */}
                                            {!giveaway.prize_claimed && (
                                                <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row">
                                                    <Button
                                                        onClick={() => {
                                                            if (confirm('Mark prize as claimed for this winner?')) {
                                                                handleClaimPrize();
                                                            }
                                                        }}
                                                        disabled={submittingClaim}
                                                        size="sm"
                                                        className="w-full bg-green-600 hover:bg-green-700 sm:flex-1"
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Claimed
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setWinnerToReject(winner.id);
                                                            setShowRejectModal(true);
                                                        }}
                                                        disabled={submittingClaim}
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full border-red-300 text-red-600 hover:bg-red-50 sm:flex-1"
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}

                                            {giveaway.prize_claimed && (
                                                <div className="rounded-md border border-green-300 bg-green-100 p-3">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-700" />
                                                        <p className="text-sm font-medium text-green-800">Prize Claimed</p>
                                                    </div>
                                                    {giveaway.prize_claimed_at && (
                                                        <p className="mt-1 text-xs text-green-700">
                                                            {new Date(giveaway.prize_claimed_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {giveaway.rejection_reason && (
                                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
                                        <p className="text-sm font-medium text-red-800">Previous Rejection</p>
                                        <p className="mt-1 text-xs text-red-600">{giveaway.rejection_reason}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reject Winner Modal */}
                        {showRejectModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Reject Winner{' '}
                                        {winnerToReject && giveaway.winners && (
                                            <span className="text-muted-foreground text-base font-normal">
                                                ({giveaway.winners.find((w) => w.id === winnerToReject)?.name})
                                            </span>
                                        )}
                                    </h3>

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
                                                setWinnerToReject(null);
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
                                {giveaway.entries_count > 0 && (giveaway.winners?.length || 0) < giveaway.number_of_winners && (
                                    <Button className="w-full" onClick={handleWinnerSelection}>
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Select {(giveaway.winners?.length || 0) === 0 ? 'Winner' : 'Next Winner'} (
                                        {(giveaway.winners?.length || 0) + 1}/{giveaway.number_of_winners})
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
