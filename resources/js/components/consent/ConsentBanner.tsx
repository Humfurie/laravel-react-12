import { Button } from '@/components/ui/button';
import { Cookie, Settings, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConsentModal from './ConsentModal';

interface ConsentChoice {
    ad_storage: 'granted' | 'denied';
    ad_user_data: 'granted' | 'denied';
    ad_personalization: 'granted' | 'denied';
    analytics_storage: 'granted' | 'denied';
    [key: string]: 'granted' | 'denied';
}

/**
 * Google-compliant Consent Banner with 3 Choices
 * - Accept All (Consent)
 * - Reject All (Do not consent)
 * - Manage Options (Customize preferences)
 *
 * Implements Google Consent Mode v2 for GDPR/CCPA compliance
 */
export default function ConsentBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // Check if user has already made a consent choice
        const consentChoice = localStorage.getItem('gdpr_consent');
        if (!consentChoice) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => clearTimeout(timer);
        } else {
            // Apply saved consent preferences
            const consent = JSON.parse(consentChoice) as ConsentChoice;
            updateConsentMode(consent);
        }
    }, []);

    const updateConsentMode = (consent: ConsentChoice) => {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', consent);
        }
    };

    const handleAcceptAll = () => {
        const consent: ConsentChoice = {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
        };

        localStorage.setItem('gdpr_consent', JSON.stringify(consent));
        localStorage.setItem('gdpr_consent_timestamp', new Date().toISOString());
        updateConsentMode(consent);
        setShowBanner(false);
    };

    const handleRejectAll = () => {
        const consent: ConsentChoice = {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        };

        localStorage.setItem('gdpr_consent', JSON.stringify(consent));
        localStorage.setItem('gdpr_consent_timestamp', new Date().toISOString());
        updateConsentMode(consent);
        setShowBanner(false);
    };

    const handleManageOptions = () => {
        setShowModal(true);
    };

    const handleSavePreferences = (preferences: ConsentChoice) => {
        localStorage.setItem('gdpr_consent', JSON.stringify(preferences));
        localStorage.setItem('gdpr_consent_timestamp', new Date().toISOString());
        updateConsentMode(preferences);
        setShowModal(false);
        setShowBanner(false);
    };

    if (!showBanner && !showModal) return null;

    return (
        <>
            {/* Consent Banner */}
            {showBanner && (
                <div className="animate-in slide-in-from-bottom fixed right-0 bottom-0 left-0 z-50">
                    {/* Backdrop overlay */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                    {/* Banner content */}
                    <div className="relative mx-auto max-w-7xl p-4">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                {/* Left side - Icon and message */}
                                <div className="flex flex-1 items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                                        <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">We value your privacy</h3>
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            We use cookies and similar technologies to provide, protect, and improve our services. This includes
                                            personalizing content and ads. By clicking "Accept All", you consent to our use of cookies.
                                        </p>
                                        <button
                                            onClick={() => {
                                                /* TODO: Add privacy policy link */
                                            }}
                                            className="mt-2 text-sm font-medium text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                                        >
                                            Learn more about our privacy practices
                                        </button>
                                    </div>
                                </div>

                                {/* Right side - Action buttons */}
                                <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                                    {/* Accept All Button */}
                                    <Button
                                        onClick={handleAcceptAll}
                                        className="from-brand-orange to-brand-gold w-full transform bg-gradient-to-r text-white shadow-md transition-all hover:scale-105 hover:shadow-lg sm:w-auto"
                                    >
                                        <Shield className="mr-2 h-4 w-4" />
                                        Accept All
                                    </Button>

                                    {/* Reject All Button */}
                                    <Button
                                        onClick={handleRejectAll}
                                        variant="outline"
                                        className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 sm:w-auto dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Reject All
                                    </Button>

                                    {/* Manage Options Button */}
                                    <Button
                                        onClick={handleManageOptions}
                                        variant="ghost"
                                        className="w-full text-gray-600 hover:bg-gray-100 sm:w-auto dark:text-gray-400 dark:hover:bg-gray-800"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Manage Options
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Consent Preferences Modal */}
            {showModal && <ConsentModal onClose={() => setShowModal(false)} onSave={handleSavePreferences} />}
        </>
    );
}
