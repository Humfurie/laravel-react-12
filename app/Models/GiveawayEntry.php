<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiveawayEntry extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_VERIFIED = 'verified';
    const STATUS_WINNER = 'winner';
    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'giveaway_id',
        'name',
        'phone',
        'facebook_url',
        'status',
        'entry_date',
    ];

    protected $casts = [
        'entry_date' => 'datetime',
    ];

    /**
     * Relationship: Entry belongs to a giveaway
     */
    public function giveaway(): BelongsTo
    {
        return $this->belongsTo(Giveaway::class);
    }

    /**
     * Mark this entry as winner
     */
    public function markAsWinner(): void
    {
        $this->update(['status' => self::STATUS_WINNER]);
    }

    /**
     * Mark this entry as verified
     */
    public function markAsVerified(): void
    {
        $this->update(['status' => self::STATUS_VERIFIED]);
    }

    /**
     * Mark this entry as rejected (permanently excluded from winning)
     */
    public function markAsRejected(): void
    {
        $this->update(['status' => self::STATUS_REJECTED]);
    }

    /**
     * Check if entry is a winner
     */
    public function isWinner(): bool
    {
        return $this->status === self::STATUS_WINNER;
    }

    /**
     * Check if entry is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Check if entry is verified
     */
    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    /**
     * Scope: Get only winners
     */
    public function scopeWinners($query)
    {
        return $query->where('status', self::STATUS_WINNER);
    }

    /**
     * Scope: Get verified entries
     */
    public function scopeVerified($query)
    {
        return $query->where('status', self::STATUS_VERIFIED);
    }

    /**
     * Scope: Get pending entries
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Get rejected entries (disqualified from winning)
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Scope: Get eligible entries (can be selected as winner)
     */
    public function scopeEligible($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_VERIFIED]);
    }
}
