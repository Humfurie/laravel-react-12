import FloatingNav from '@/components/floating-nav';
import Footer from '@/components/global/Footer';
import type { User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { Github, MessageSquareHeart, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface GuestbookEntryData {
    id: number;
    message: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar_url: string | null;
        github_username: string | null;
    };
}

interface Props {
    entries: {
        data: GuestbookEntryData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

function SignInPrompt() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800 md:p-8">
            <MessageSquareHeart className="mx-auto mb-4 h-10 w-10 text-orange-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Sign in to leave a message</h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Authenticate with your GitHub or Google account to sign the guestbook.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                    href="/auth/github/redirect?intended=/guestbook"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 sm:w-auto"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    Sign in with GitHub
                </a>
                <a
                    href="/auth/google/redirect?intended=/guestbook"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google
                </a>
            </div>
        </div>
    );
}

function GuestbookForm({ onNewEntry }: { onNewEntry: (entry: GuestbookEntryData) => void }) {
    const [message, setMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || processing) return;

        setProcessing(true);
        setError('');

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const res = await fetch('/guestbook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ message }),
            });

            if (res.status === 422) {
                const data = await res.json();
                setError(data.errors?.message?.[0] || 'Validation failed.');
                return;
            }
            if (res.status === 429) {
                setError('Too many messages. Please wait a bit before posting again.');
                return;
            }
            if (!res.ok) {
                setError('Something went wrong. Please try again.');
                return;
            }

            const data = await res.json();
            onNewEntry(data.entry);
            setMessage('');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message, say hello, or share your thoughts..."
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-orange-500/50 dark:focus:bg-gray-800"
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500">{message.length}/500</span>
                <button
                    type="submit"
                    disabled={processing || !message.trim()}
                    className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? 'Signing...' : 'Sign Guestbook'}
                </button>
            </div>
        </form>
    );
}

function GuestbookEntryCard({
    entry,
    currentUserId,
    onDelete,
}: {
    entry: GuestbookEntryData;
    currentUserId?: number;
    onDelete: (id: number) => void;
}) {
    const isOwn = currentUserId === entry.user.id;

    return (
        <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-gray-700 md:p-5">
            {/* Avatar */}
            <div className="shrink-0">
                {entry.user.avatar_url ? (
                    <img
                        src={entry.user.avatar_url}
                        alt={entry.user.name}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.user.name}</span>
                    {entry.user.github_username && (
                        <a
                            href={`https://github.com/${entry.user.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                            <Github className="h-3 w-3" />
                            {entry.user.github_username}
                        </a>
                    )}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{entry.message}</p>
            </div>

            {/* Delete button (own entries only) */}
            {isOwn && (
                <button
                    onClick={() => {
                        if (confirm('Remove your message?')) {
                            onDelete(entry.id);
                        }
                    }}
                    className="shrink-0 self-start rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete message"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export default function Guestbook({ entries: initialEntries }: Props) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const [entries, setEntries] = useState(initialEntries.data);
    const [total, setTotal] = useState(initialEntries.total);
    const initialIds = useRef(new Set(initialEntries.data.map((e) => e.id)));
    const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set());

    const handleNewEntry = (entry: GuestbookEntryData) => {
        setAnimatingIds((prev) => new Set(prev).add(entry.id));
        setEntries((prev) => [entry, ...prev]);
        setTotal((prev) => prev + 1);
    };

    const handleDelete = async (id: number) => {
        // Optimistically remove from UI
        const previousEntries = entries;
        const previousTotal = total;
        setEntries((prev) => prev.filter((e) => e.id !== id));
        setTotal((prev) => prev - 1);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
            const res = await fetch(`/guestbook/${id}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });
            if (!res.ok) throw new Error();
        } catch {
            // Revert on failure
            setEntries(previousEntries);
            setTotal(previousTotal);
        }
    };

    return (
        <>
            <Head title="Guestbook">
                <meta name="description" content="Sign the guestbook and leave a message. Say hello or share your thoughts!" />
            </Head>

            <FloatingNav currentPage="guestbook" />

            <main className="min-h-screen bg-[#FAFAF8] pt-20 dark:bg-gray-900">
                <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                            <span className="text-orange-500">G</span>uestbook
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Leave a message, say hello, or share your thoughts.</p>
                        {total > 0 && (
                            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                                {total} {total === 1 ? 'message' : 'messages'} so far
                            </p>
                        )}
                    </div>

                    {/* Form or Sign-in */}
                    <div className="mb-8">{auth.user ? <GuestbookForm onNewEntry={handleNewEntry} /> : <SignInPrompt />}</div>

                    {/* Entries List */}
                    {entries.length > 0 ? (
                        <div className="space-y-3">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className={animatingIds.has(entry.id) ? 'animate-fade-in-down' : ''}
                                    onAnimationEnd={() => {
                                        setAnimatingIds((prev) => {
                                            const next = new Set(prev);
                                            next.delete(entry.id);
                                            return next;
                                        });
                                    }}
                                >
                                    <GuestbookEntryCard entry={entry} currentUserId={auth.user?.id} onDelete={handleDelete} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <MessageSquareHeart className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <p className="text-gray-500 dark:text-gray-400">No messages yet. Be the first to sign the guestbook!</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {initialEntries.last_page > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            {Array.from({ length: initialEntries.last_page }, (_, i) => i + 1).map((page) => (
                                <a
                                    key={page}
                                    href={`/guestbook?page=${page}`}
                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                        page === initialEntries.current_page
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {page}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
