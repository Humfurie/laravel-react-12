import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { raffleNavItems } from '@/config/navigation';
import { Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import { type ReactNode } from 'react';

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="bg-background min-h-screen">
            {/* Public Navbar */}
            <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <AppLogo />
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-4">
                        {raffleNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.route}
                                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                        <Link href="/raffles/winners">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Trophy className="h-4 w-4" />
                                <span className="hidden sm:inline">Winners</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-muted/30 border-t py-8">
                <div className="text-muted-foreground container mx-auto px-4 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
