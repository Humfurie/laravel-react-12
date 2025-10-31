<?php

namespace App\Console\Commands;

use App\Models\Raffle;
use Illuminate\Console\Command;

class SelectRaffleWinners extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'raffles:select-winners';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically select winners for ended raffles that don\'t have a winner yet';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for ended raffles without winners...');

        // Find all raffles that:
        // 1. Have status 'active'
        // 2. End date has passed
        // 3. Don't have a winner yet
        // 4. Have at least 1 entry
        $raffles = Raffle::where('status', Raffle::STATUS_ACTIVE)
            ->where('end_date', '<', now())
            ->whereNull('winner_id')
            ->has('entries')
            ->get();

        if ($raffles->isEmpty()) {
            $this->info('No raffles found that need winner selection.');
            return Command::SUCCESS;
        }

        $this->info("Found {$raffles->count()} raffle(s) that need winner selection.");

        $successCount = 0;
        $failCount = 0;

        foreach ($raffles as $raffle) {
            $this->line("Processing raffle: {$raffle->title}");

            try {
                $winner = $raffle->selectWinner();

                if ($winner) {
                    $this->info("  ✓ Winner selected: {$winner->name}");
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
