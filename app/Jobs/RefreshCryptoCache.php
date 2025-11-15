<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RefreshCryptoCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    /**
     * Execute the job - Refresh all crypto data in the background.
     */
    public function handle(): void
    {
        Log::info("Starting crypto cache refresh");

        // Dispatch jobs to fetch fresh crypto data
        FetchCryptoData::dispatch('getCryptoList', [
            'vs_currency' => 'usd',
            'order' => 'market_cap_desc',
            'per_page' => 100,
            'page' => 1,
        ]);

        FetchCryptoData::dispatch('getTrendingCryptos', []);

        // Fetch top 10 crypto details
        $topCoins = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
            'ripple', 'polkadot', 'dogecoin', 'avalanche-2', 'shiba-inu'];

        foreach ($topCoins as $coinId) {
            FetchCryptoData::dispatch('getCryptoDetail', ['coinId' => $coinId]);
        }

        Log::info("Crypto cache refresh jobs dispatched");
    }
}
