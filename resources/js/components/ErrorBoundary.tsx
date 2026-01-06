import { AlertCircle } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
                    <Card className="w-full max-w-md">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
                                <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
                                <p className="text-muted-foreground mb-6 text-sm">
                                    We encountered an error while displaying this page. Please try refreshing or go back to the homepage.
                                </p>
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <div className="mb-4 w-full overflow-auto rounded-md bg-red-50 p-4 text-left">
                                        <p className="mb-2 text-xs font-semibold text-red-900">Error Details:</p>
                                        <pre className="text-xs text-red-700">{this.state.error.message}</pre>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button onClick={() => window.location.reload()} variant="default">
                                        Refresh Page
                                    </Button>
                                    <Button onClick={() => (window.location.href = '/')} variant="outline">
                                        Go Home
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
