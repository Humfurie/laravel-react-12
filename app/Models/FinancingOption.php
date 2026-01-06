<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancingOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_pricing_id',
        'bank_name',
        'loan_to_value_ratio',
        'interest_rate',
        'loan_term_years',
        'monthly_amortization',
        'processing_fee',
        'requirements',
        'is_active',
    ];

    protected $casts = [
        'loan_to_value_ratio' => 'decimal:2',
        'interest_rate' => 'decimal:2',
        'monthly_amortization' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'loan_term_years' => 'integer',
        'requirements' => 'array',
        'is_active' => 'boolean',
    ];

    public function propertyPricing(): BelongsTo
    {
        return $this->belongsTo(PropertyPricing::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getFormattedMonthlyAmortizationAttribute()
    {
        return $this->monthly_amortization ? '₱' . number_format($this->monthly_amortization, 2) : null;
    }

    public function getFormattedInterestRateAttribute()
    {
        return $this->interest_rate ? $this->interest_rate . '%' : null;
    }
}
