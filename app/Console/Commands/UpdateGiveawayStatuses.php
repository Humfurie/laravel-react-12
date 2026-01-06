<?php

namespace App\Console\Commands;

use App\Models\Giveaway;
use Illuminate\Console\Command;

class UpdateGiveawayStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'giveaways:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update giveaway statuses based on their start and end dates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating giveaway statuses based on dates...');

        // Find giveaways that should have ended (end_date passed but status is still active)
        $endedGiveaways = Giveaway::where('status', Giveaway::STATUS_ACTIVE)
            ->where('end_date', '<', now())
            ->get();

        if ($endedGiveaways->isNotEmpty()) {
            $this->info("Found {$endedGiveaways->count()} giveaway(s) that should be ended.");

            foreach ($endedGiveaways as $giveaway) {
                $giveaway->update(['status' => Giveaway::STATUS_ENDED]);
                $this->line("  ✓ Ended: {$giveaway->title}");
            }
        }

        // Find draft giveaways that should start (start_date arrived and before end_date)
        // Note: This only applies to drafts that were scheduled to auto-start
        // Admins can manually set status to active regardless of dates
        $startingGiveaways = Giveaway::where('status', Giveaway::STATUS_DRAFT)
            ->where('start_date', '<=', now())
            ->where('end_date', '>', now())
            ->get();

        if ($startingGiveaways->isNotEmpty()) {
            $this->info("Found {$startingGiveaways->count()} draft giveaway(s) ready to start.");

            foreach ($startingGiveaways as $giveaway) {
                // Only auto-start if explicitly configured (you can add a flag if needed)
                // For now, we'll just log them without changing status
                // Admins should manually activate giveaways
                $this->line("  ⚠ Draft giveaway ready: {$giveaway->title} (requires manual activation)");
            }
        }

        $this->newLine();
        $this->info('Giveaway status update complete.');

        return Command::SUCCESS;
    }
}
