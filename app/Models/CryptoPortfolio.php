<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CryptoPortfolio extends Model
{
    protected $fillable = [
        'user_id',
        'coin_id',
        'symbol',
        'name',
        'holdings',
        'purchase_price',
        'total_invested',
        'purchase_date',
        'notes',
    ];

    protected $casts = [
        'holdings' => 'decimal:8',
        'purchase_price' => 'decimal:8',
        'total_invested' => 'decimal:2',
        'purchase_date' => 'datetime',
    ];

    /**
     * Get the user that owns the portfolio entry
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate profit/loss percentage
     */
    public function calculateProfitPercentage(float $currentPrice): float
    {
        if (!$this->total_invested || $this->total_invested == 0) {
            return 0;
        }

        $profit = $this->calculateProfit($currentPrice);
        return ($profit / (float)$this->total_invested) * 100;
    }

    /**
     * Calculate profit/loss
     */
    public function calculateProfit(float $currentPrice): float
    {
        $currentValue = $this->calculateCurrentValue($currentPrice);
        return $currentValue - (float)$this->total_invested;
    }

    /**
     * Calculate current value based on holdings and current price
     */
    public function calculateCurrentValue(float $currentPrice): float
    {
        return (float)$this->holdings * $currentPrice;
    }
}
