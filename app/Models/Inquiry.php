<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    use HasFactory;

    const STATUS_NEW = 'new';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_RESPONDED = 'responded';
    const STATUS_CLOSED = 'closed';

    const TYPE_SITE_VISIT = 'site_visit';
    const TYPE_PRICING_INFO = 'pricing_info';
    const TYPE_AVAILABILITY = 'availability';
    const TYPE_FINANCING = 'financing';
    const TYPE_GENERAL = 'general';

    protected $fillable = [
        'property_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'inquiry_type',
        'message',
        'preferred_contact_time',
        'status',
        'agent_notes',
        'followed_up_at',
        'created_at',
    ];

    protected $casts = [
        'followed_up_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function scopeNew($query)
    {
        return $query->where('status', self::STATUS_NEW);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('inquiry_type', $type);
    }

    public function scopeNeedsFollowUp($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS)
                    ->where(function($q) {
                        $q->whereNull('followed_up_at')
                          ->orWhere('followed_up_at', '<', now()->subDays(3));
                    });
    }

    public function markAsResponded()
    {
        $this->update([
            'status' => self::STATUS_RESPONDED,
            'followed_up_at' => now(),
        ]);
    }

    public function markAsInProgress()
    {
        $this->update(['status' => self::STATUS_IN_PROGRESS]);
    }

    public function isNew(): bool
    {
        return $this->status === self::STATUS_NEW;
    }

    public function needsFollowUp(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS &&
               (!$this->followed_up_at || $this->followed_up_at < now()->subDays(3));
    }
}
