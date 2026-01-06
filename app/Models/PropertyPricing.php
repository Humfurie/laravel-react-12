<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PropertyPricing extends Model
{
    use HasFactory;

    protected $table = 'property_pricing';

    protected $fillable = [
        'property_id',
        'reservation_fee',
        'total_contract_price',
        'net_selling_price',
        'currency',
        'downpayment_percentage',
        'downpayment_amount',
        'equity_terms_months',
        'monthly_equity',
        'balloon_payment',
        'balloon_payment_month',
        'bank_financing_amount',
        'bank_financing_percentage',
        'miscellaneous_fees_included',
        'transfer_fee_percentage',
        'move_in_fee_percentage',
        'association_dues_monthly',
        'parking_slot_price',
        'payment_scheme_name',
        'payment_notes',
    ];

    protected $casts = [
        'reservation_fee' => 'decimal:2',
        'total_contract_price' => 'decimal:2',
        'net_selling_price' => 'decimal:2',
        'downpayment_percentage' => 'decimal:2',
        'downpayment_amount' => 'decimal:2',
        'monthly_equity' => 'decimal:2',
        'balloon_payment' => 'decimal:2',
        'bank_financing_amount' => 'decimal:2',
        'bank_financing_percentage' => 'decimal:2',
        'transfer_fee_percentage' => 'decimal:2',
        'move_in_fee_percentage' => 'decimal:2',
        'association_dues_monthly' => 'decimal:2',
        'parking_slot_price' => 'decimal:2',
        'miscellaneous_fees_included' => 'boolean',
        'equity_terms_months' => 'integer',
        'balloon_payment_month' => 'integer',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function financingOptions(): HasMany
    {
        return $this->hasMany(FinancingOption::class);
    }

    public function getFormattedTotalContractPriceAttribute()
    {
        return '₱' . number_format($this->total_contract_price, 2);
    }

    public function getFormattedMonthlyEquityAttribute()
    {
        return $this->monthly_equity ? '₱' . number_format($this->monthly_equity, 2) : null;
    }
}
