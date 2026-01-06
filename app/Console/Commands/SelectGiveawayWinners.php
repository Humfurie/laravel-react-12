<?php

namespace App\Console\Commands;

use App\Models\Giveaway;
use Illuminate\Console\Command;

class SelectGiveawayWinners extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'giveaways:select-winners';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically select winners for ended giveaways that don\'t have all winners yet';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for ended giveaways that need winner selection...');

        // Find all giveaways that:
        // 1. Have status 'active'
        // 2. End date has passed
        // 3. Have at least 1 entry
        $giveaways = Giveaway::where('status', Giveaway::STATUS_ACTIVE)
            ->where('end_date', '<', now())
            ->has('entries')
            ->get();

        // Filter out giveaways that already have all winners selected
        $giveaways = $giveaways->filter(function ($giveaway) {
            $requiredWinners = $giveaway->number_of_winners ?? 1;
            $currentWinnersCount = $giveaway->winners()->count();
            return $currentWinnersCount < $requiredWinners;
        });

        if ($giveaways->isEmpty()) {
            $this->info('No giveaways found that need winner selection.');
            return Command::SUCCESS;
        }

        $this->info("Found {$giveaways->count()} giveaway(s) that need winner selection.");

        $successCount = 0;
        $failCount = 0;

        foreach ($giveaways as $giveaway) {
            $requiredWinners = $giveaway->number_of_winners ?? 1;
            $currentWinners = $giveaway->winners()->count();
            $winnersNeeded = $requiredWinners - $currentWinners;

            $this->line("Processing giveaway: {$giveaway->title} (needs {$winnersNeeded} winner(s))");

            try {
                $winner = $giveaway->selectWinner();

                if ($winner) {
                    $totalWinners = $giveaway->winners()->count();
                    $this->info("  ✓ Winner(s) selected! Total winners: {$totalWinners}/{$requiredWinners}");
                    $successCount++;
                } else {
                    $this->error("  ✗ Failed to select winner (no eligible entries)");
                    $failCount++;
                }
            } catch (\Exception $e) {
                $this->error("  ✗ Error: {$e->getMessage()}");
                $failCount++;
            }
        }

        $this->newLine();
        $this->info("Summary:");
        $this->info("  Successful: {$successCount}");
        if ($failCount > 0) {
            $this->warn("  Failed: {$failCount}");
        }

        return Command::SUCCESS;
    }
}
