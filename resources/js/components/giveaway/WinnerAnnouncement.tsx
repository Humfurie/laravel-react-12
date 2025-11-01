import { Button } from '@/components/ui/button';
import { Gift, Users } from 'lucide-react';

interface WinnerAnnouncementProps {
    totalEntries: number;
    winner?: string | null;
    winnerAnnounced?: boolean;
    isSelecting?: boolean;
    onSelectWinner?: () => void;
    canSelectWinner?: boolean;
    isAdmin?: boolean;
}

/**
 * WinnerAnnouncement Component
 *
 * Displays giveaway participant information and winner announcement
 * Clean, professional display without gambling elements
 */
export default function WinnerAnnouncement({
    totalEntries,
    winner,
    winnerAnnounced = false,
    isSelecting = false,
    onSelectWinner,
    canSelectWinner = false,
    isAdmin = false,
}: WinnerAnnouncementProps) {
    if (totalEntries === 0) {
        return (
            <div className="border-primary/20 bg-primary/5 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <Gift className="text-primary/40 mb-4 h-16 w-16" />
                <p className="text-foreground text-center text-lg font-semibold">No entries yet</p>
                <p className="text-muted-foreground text-center text-sm">Be the first to join this giveaway!</p>
            </div>
        );
    }

    // Winner has been announced
    if (winnerAnnounced && winner) {
        return (
            <div className="border-primary from-primary/10 to-primary/5 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 bg-gradient-to-br p-8">
                <div className="bg-primary text-primary-foreground mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                    <Gift className="h-10 w-10" />
                </div>
                <h3 className="text-foreground mb-2 text-2xl font-bold">Congratulations!</h3>
                <p className="text-primary mb-4 text-center text-3xl font-bold">{winner}</p>
                <p className="text-muted-foreground text-center text-sm">
                    Selected from {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
                </p>
            </div>
        );
    }

    // Show participant count and admin controls
    return (
        <div className="border-primary/30 from-background to-primary/5 flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gradient-to-br p-8">
            <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                <Users className="h-10 w-10" />
            </div>

            <h3 className="text-foreground mb-2 text-2xl font-bold">
                {totalEntries} {totalEntries === 1 ? 'Entry' : 'Entries'}
            </h3>

            <p className="text-muted-foreground mb-6 text-center">
                {isAdmin && canSelectWinner ? 'Ready to select a winner' : 'Good luck to all participants!'}
            </p>

            {isAdmin && canSelectWinner && onSelectWinner && (
                <Button onClick={onSelectWinner} disabled={isSelecting} size="lg" className="mt-4">
                    {isSelecting ? (
                        <>
                            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Selecting Winner...
                        </>
                    ) : (
                        <>
                            <Gift className="mr-2 h-5 w-5" />
                            Select Winner
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
