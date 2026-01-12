import SocialMediaLayout from '@/layouts/SocialMediaLayout';
import type { DatesSetArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Calendar event structure from backend
 */
interface CalendarEvent {
    id: number;
    title: string;
    start: string;
    backgroundColor: string;
    borderColor: string;
    extendedProps: {
        platform: string;
        account_name: string;
        status: string;
    };
}

/**
 * Social account data for platform filter
 */
interface SocialAccount {
    id: number;
    platform: string;
    username: string;
    display_name: string;
}

/**
 * Calendar page props from backend
 */
interface CalendarProps {
    accounts: SocialAccount[];
}

/**
 * Platform color mapping for calendar events
 */
const PLATFORM_COLORS: Record<string, string> = {
    youtube: '#FF0000',
    facebook: '#1877F2',
    instagram: '#E4405F',
    tiktok: '#000000',
    threads: '#000000',
};

/**
 * Content Calendar Page
 *
 * Displays a calendar view of all scheduled social media posts across all platforms.
 *
 * Features:
 * - Full calendar view with monthly/weekly navigation
 * - Color-coded events by platform
 * - Platform filter to show/hide specific platforms
 * - Event click to view post details
 * - Drag-to-reschedule functionality
 * - Automatic refresh when date range changes
 *
 * Uses FullCalendar library for calendar rendering and interactions.
 */
export default function Calendar({ accounts }: CalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    /**
     * Get unique platforms from accounts
     */
    const platforms = Array.from(new Set(accounts.map((account) => account.platform)));

    /**
     * Fetch calendar events from the backend
     * Filters by date range and selected platforms
     */
    const fetchEvents = async (start: Date, end: Date) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                start: start.toISOString(),
                end: end.toISOString(),
            });

            const response = await fetch(route('admin.social-media.calendar.events') + '?' + params.toString());
            const data = await response.json();

            // Filter events by selected platforms
            const filteredEvents =
                selectedPlatforms.length > 0 ? data.filter((event: CalendarEvent) => selectedPlatforms.includes(event.extendedProps.platform)) : data;

            setEvents(filteredEvents);
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle date range change (month/week navigation)
     * Triggered when user navigates to different date range
     */
    const handleDatesSet = (arg: DatesSetArg) => {
        fetchEvents(arg.start, arg.end);
    };

    /**
     * Handle event click - navigate to post details
     */
    const handleEventClick = (clickInfo: EventClickArg) => {
        const postId = clickInfo.event.id;
        router.visit(route('admin.social-media.posts.show', postId));
    };

    /**
     * Handle event drop (drag-to-reschedule)
     * Updates the post's scheduled_at time
     */
    const handleEventDrop = async (dropInfo: EventDropArg) => {
        const postId = dropInfo.event.id;
        const newDate = dropInfo.event.start;

        if (!newDate) {
            dropInfo.revert();
            return;
        }

        try {
            // Update scheduled_at via API
            await router.put(
                route('admin.social-media.posts.update', postId),
                {
                    scheduled_at: newDate.toISOString(),
                },
                {
                    preserveScroll: true,
                    onError: () => {
                        // Revert the event position if update fails
                        dropInfo.revert();
                    },
                },
            );
        } catch (error) {
            console.error('Failed to reschedule post:', error);
            dropInfo.revert();
        }
    };

    /**
     * Toggle platform filter
     * Shows/hides events for specific platform
     */
    const togglePlatform = (platform: string) => {
        setSelectedPlatforms((prev) => {
            if (prev.includes(platform)) {
                return prev.filter((p) => p !== platform);
            }
            return [...prev, platform];
        });
    };

    /**
     * Select all platforms
     */
    const selectAllPlatforms = () => {
        setSelectedPlatforms([]);
    };

    /**
     * Refresh events when platform filter changes
     */
    useEffect(() => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const view = calendarApi.view;
            fetchEvents(view.currentStart, view.currentEnd);
        }
    }, [selectedPlatforms]);

    return (
        <SocialMediaLayout title="Content Calendar">
            <div className="space-y-6 p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Calendar</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage your scheduled posts across all platforms</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.visit(route('admin.social-media.posts.create'))}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Create Post
                        </button>
                    </div>
                </div>

                {/* Platform Filter */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Filter by Platform</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={selectAllPlatforms}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                selectedPlatforms.length === 0
                                    ? 'bg-gray-800 text-white dark:bg-gray-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            All Platforms
                        </button>

                        {platforms.map((platform) => (
                            <button
                                key={platform}
                                onClick={() => togglePlatform(platform)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                    selectedPlatforms.includes(platform) || selectedPlatforms.length === 0
                                        ? 'text-white'
                                        : 'bg-gray-100 text-gray-400 line-through hover:bg-gray-200 dark:bg-gray-700'
                                }`}
                                style={{
                                    backgroundColor:
                                        selectedPlatforms.includes(platform) || selectedPlatforms.length === 0
                                            ? PLATFORM_COLORS[platform] || '#6B7280'
                                            : undefined,
                                }}
                            >
                                {platform}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calendar */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    {loading && <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">Loading events...</div>}

                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek',
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        datesSet={handleDatesSet}
                        editable={true}
                        droppable={true}
                        height="auto"
                        eventDisplay="block"
                        // Styling
                        eventTextColor="#ffffff"
                        eventBorderColor="transparent"
                        eventBackgroundColor="#3B82F6"
                        // Event content customization
                        eventContent={(eventInfo) => {
                            return (
                                <div className="overflow-hidden px-1 py-0.5 text-xs">
                                    <div className="truncate font-medium">{eventInfo.event.title}</div>
                                    <div className="truncate text-[10px] opacity-90">{eventInfo.event.extendedProps.account_name}</div>
                                </div>
                            );
                        }}
                        // Dark mode support via CSS custom properties
                        dayCellClassNames="dark:bg-gray-800 dark:text-gray-200"
                        viewClassNames="dark:bg-gray-800"
                    />
                </div>

                {/* Legend */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Legend</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {platforms.map((platform) => (
                            <div key={platform} className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded" style={{ backgroundColor: PLATFORM_COLORS[platform] || '#6B7280' }} />
                                <span className="text-gray-900 capitalize dark:text-white">{platform}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Tip:</strong> Click on an event to view post details, or drag and drop to reschedule.
                        </p>
                    </div>
                </div>
            </div>
        </SocialMediaLayout>
    );
}
