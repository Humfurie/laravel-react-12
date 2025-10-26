import { Button } from '@/components/ui/button';
import { BarChart, Settings as SettingsIcon, Shield, Target, X } from 'lucide-react';
import { useState } from 'react';

interface ConsentChoice {
    ad_storage: 'granted' | 'denied';
    ad_user_data: 'granted' | 'denied';
    ad_personalization: 'granted' | 'denied';
    analytics_storage: 'granted' | 'denied';
    [key: string]: 'granted' | 'denied';
}

interface ConsentModalProps {
    onClose: () => void;
    onSave: (preferences: ConsentChoice) => void;
}

interface ConsentCategory {
    id: keyof ConsentChoice;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    required: boolean;
}

/**
 * Consent Preferences Modal
 * Allows users to granularly control cookie preferences
 */
export default function ConsentModal({ onClose, onSave }: ConsentModalProps) {
    // Load saved preferences or default to denied
    const getSavedPreferences = (): ConsentChoice => {
        const saved = localStorage.getItem('gdpr_consent');
        if (saved) {
            return JSON.parse(saved) as ConsentChoice;
        }
        return {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        };
    };

    const [preferences, setPreferences] = useState<ConsentChoice>(getSavedPreferences());

    const categories: ConsentCategory[] = [
        {
            id: 'ad_storage',
            title: 'Advertising Cookies',
            description: 'These cookies enable personalized advertising based on your browsing behavior.',
            icon: Target,
            required: false,
        },
        {
            id: 'ad_user_data',
            title: 'Ad User Data',
            description: 'Allows sharing of user data with advertising platforms for better ad targeting.',
            icon: Shield,
            required: false,
        },
        {
            id: 'ad_personalization',
            title: 'Ad Personalization',
            description: 'Enables personalized ads based on your interests and previous interactions.',
            icon: Target,
            required: false,
        },
        {
            id: 'analytics_storage',
            title: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our website to improve user experience.',
            icon: BarChart,
            required: false,
        },
    ];

    const togglePreference = (id: keyof ConsentChoice) => {
        setPreferences((prev) => {
            const newValue: 'granted' | 'denied' = prev[id] === 'granted' ? 'denied' : 'granted';
            return {
                ...prev,
                [id]: newValue,
            };
        });
    };

    const handleAcceptAll = () => {
        const allGranted: ConsentChoice = {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
        };
        onSave(allGranted);
    };

    const handleRejectAll = () => {
        const allDenied: ConsentChoice = {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        };
        onSave(allDenied);
    };

    const handleSavePreferences = () => {
        onSave(preferences);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="animate-in fade-in zoom-in fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 transform">
                <div className="m-4 max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                    {/* Header */}
                    <div className="from-brand-orange to-brand-gold flex items-center justify-between bg-gradient-to-r p-6 text-white">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-white/20 p-3">
                                <SettingsIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Privacy Preferences</h2>
                                <p className="text-sm text-orange-100">Manage your cookie and data consent settings</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-white/20" aria-label="Close modal">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[60vh] overflow-y-auto p-6">
                        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                            We use cookies and similar technologies to enhance your browsing experience, serve personalized content and ads, and
                            analyze our traffic. You can choose which types of cookies to allow below.
                        </p>

                        {/* Essential Cookies (Always ON) */}
                        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 rounded-full bg-green-100 p-2 dark:bg-green-900">
                                        <Shield className="h-5 w-5 text-green-600 dark:text-green-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">Essential Cookies</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Required for the website to function properly. These cannot be disabled.
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <div className="flex h-10 items-center rounded-full bg-green-500 px-4 text-sm font-semibold text-white">
                                        Always ON
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optional Cookie Categories */}
                        <div className="space-y-4">
                            {categories.map((category) => {
                                const Icon = category.icon;
                                const isEnabled = preferences[category.id] === 'granted';

                                return (
                                    <div
                                        key={category.id}
                                        className="rounded-xl border border-gray-200 bg-white p-4 transition-all dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`mt-1 rounded-full p-2 ${
                                                        isEnabled
                                                            ? 'from-brand-orange to-brand-gold bg-gradient-to-r text-white'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                                                    }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{category.title}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => togglePreference(category.id)}
                                                className={`relative h-10 w-16 shrink-0 rounded-full transition-colors ${
                                                    isEnabled ? 'from-brand-orange to-brand-gold bg-gradient-to-r' : 'bg-gray-300 dark:bg-gray-700'
                                                }`}
                                                aria-label={`Toggle ${category.title}`}
                                            >
                                                <span
                                                    className={`absolute top-1 h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                                                        isEnabled ? 'right-1 translate-x-0' : 'left-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer with action buttons */}
                    <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button onClick={handleRejectAll} variant="outline" className="w-full sm:w-auto">
                                    Reject All
                                </Button>
                                <Button onClick={handleAcceptAll} className="from-brand-orange to-brand-gold w-full bg-gradient-to-r sm:w-auto">
                                    Accept All
                                </Button>
                            </div>
                            <Button onClick={handleSavePreferences} className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto">
                                Save My Preferences
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
