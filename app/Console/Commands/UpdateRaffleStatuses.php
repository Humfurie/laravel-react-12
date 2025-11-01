<?php

namespace App\Console\Commands;

use App\Models\Raffle;
use Illuminate\Console\Command;

class UpdateRaffleStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'raffles:update-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update raffle statuses based on their start and end dates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating raffle statuses based on dates...');

        // Find raffles that should have ended (end_date passed but status is still active)
        $endedRaffles = Raffle::where('status', Raffle::STATUS_ACTIVE)
            ->where('end_date', '<', now())
            ->get();

        if ($endedRaffles->isNotEmpty()) {
            $this->info("Found {$endedRaffles->count()} raffle(s) that should be ended.");

            foreach ($endedRaffles as $raffle) {
                $raffle->update(['status' => Raffle::STATUS_ENDED]);
                $this->line("  ✓ Ended: {$raffle->title}");
            }
        }

        // Find draft raffles that should start (start_date arrived and before end_date)
        // Note: This only applies to drafts that were scheduled to auto-start
        // Admins can manually set status to active regardless of dates
        $startingRaffles = Raffle::where('status', Raffle::STATUS_DRAFT)
            ->where('start_date', '<=', now())
            ->where('end_date', '>', now())
            ->get();

        if ($startingRaffles->isNotEmpty()) {
            $this->info("Found {$startingRaffles->count()} draft raffle(s) ready to start.");

            foreach ($startingRaffles as $raffle) {
                // Only auto-start if explicitly configured (you can add a flag if needed)
                // For now, we'll just log them without changing status
                // Admins should manually activate raffles
                $this->line("  ⚠ Draft raffle ready: {$raffle->title} (requires manual activation)");
            }
        }

        $this->newLine();
        $this->info('Raffle status update complete.');

        return Command::SUCCESS;
    }
}
