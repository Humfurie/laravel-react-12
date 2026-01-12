import { AppShell } from '@/components/app-shell';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Calendar, Home, LayoutDashboard, ListVideo, Plus, Share2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface SocialMediaLayoutProps {
    children: ReactNode;
    title?: string;
}

/**
 * Social Media Management Layout
 *
 * Provides a consistent layout with sidebar navigation for all social media pages.
 *
 * Features:
 * - Left sidebar with navigation links
 * - Active route highlighting
 * - Responsive design (collapsible on mobile)
 * - Dark mode support
 * - Quick action buttons
 */
export default function SocialMediaLayout({ children, title }: SocialMediaLayoutProps) {
    const { url } = usePage();

    /**
     * Navigation items configuration
     */
    const navigationItems = [
        {
            name: 'Dashboard',
            href: route('admin.social-media.index'),
            icon: LayoutDashboard,
            description: 'Overview & stats',
        },
        {
            name: 'All Posts',
            href: route('admin.social-media.posts.index'),
            icon: ListVideo,
            description: 'Manage your posts',
        },
        {
            name: 'Create Post',
            href: route('admin.social-media.posts.create'),
            icon: Plus,
            description: 'New post',
        },
        {
            name: 'Analytics',
            href: route('admin.social-media.analytics.index'),
            icon: BarChart3,
            description: 'Performance metrics',
        },
        {
            name: 'Calendar',
            href: route('admin.social-media.calendar'),
            icon: Calendar,
            description: 'Content schedule',
        },
    ];

    /**
     * Check if a route is currently active
     */
    const isActive = (href: string): boolean => {
        return url.startsWith(href);
    };

    return (
        <AppShell variant="inset">
            <Head title={title || 'Social Media'} />

            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex h-full flex-col">
                        {/* Sidebar Header */}
                        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                                    <Share2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Management Hub</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                            active
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <Icon
                                            className={`h-5 w-5 flex-shrink-0 ${
                                                active
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                            }`}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className={`truncate ${active ? 'font-semibold' : ''}`}>{item.name}</div>
                                            <div className="truncate text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                <Home className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                <span>Back to Admin</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden">
                    <div className="mx-auto max-w-7xl p-6">
                        {/* Page Title (if provided) */}
                        {title && (
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            </div>
                        )}

                        {/* Page Content */}
                        {children}
                    </div>
                </main>
            </div>
        </AppShell>
    );
}
