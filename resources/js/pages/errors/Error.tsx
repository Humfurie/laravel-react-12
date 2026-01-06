import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home } from 'lucide-react';

interface Props {
    status: number;
    message?: string;
}

export default function Error({ status, message }: Props) {
    const title =
        {
            403: 'Forbidden',
            404: 'Page Not Found',
            419: 'Page Expired',
            429: 'Too Many Requests',
            500: 'Server Error',
            503: 'Service Unavailable',
        }[status] || 'Error';

    const description =
        message ||
        {
            403: "Sorry, you don't have permission to access this page.",
            404: "Sorry, the page you're looking for doesn't exist.",
            419: 'Your session has expired. Please refresh the page and try again.',
            429: 'Too many requests. Please slow down.',
            500: 'Whoops, something went wrong on our servers.',
            503: 'Sorry, we are doing some maintenance. Please check back soon.',
        }[status] ||
        'An error occurred.';

    return (
        <>
            <Head title={`${status} - ${title}`} />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md text-center">
                    {/* Error Code */}
                    <div className="mb-8">
                        <h1 className="text-9xl font-bold text-orange-500">{status}</h1>
                    </div>

                    {/* Error Title */}
                    <h2 className="mb-4 text-3xl font-bold text-gray-900">{title}</h2>

                    {/* Error Description */}
                    <p className="mb-8 text-lg text-gray-600">{description}</p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button onClick={() => window.history.back()} variant="outline" className="inline-flex items-center justify-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                        <Link href="/">
                            <Button className="inline-flex w-full items-center justify-center gap-2 sm:w-auto">
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                        </Link>
                    </div>

                    {/* Additional Help */}
                    {status === 404 && (
                        <div className="mt-8 text-sm text-gray-500">
                            If you believe this is a mistake, please{' '}
                            <a href="mailto:humfurie@gmail.com" className="text-orange-600 hover:underline">
                                contact us
                            </a>
                            .
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
