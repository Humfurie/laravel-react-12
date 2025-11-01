<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Giveaway extends Model
{
    use HasFactory, SoftDeletes;

    const STATUS_DRAFT = 'draft';
    const STATUS_ACTIVE = 'active';
    const STATUS_ENDED = 'ended';

    protected $fillable = [
        'title',
        'slug',
        'description',
        'start_date',
        'end_date',
        'status',
        'winner_id',
        'prize_claimed',
        'prize_claimed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'prize_claimed_at' => 'datetime',
        'prize_claimed' => 'boolean',
    ];

    protected $appends = [
        'is_active',
        'has_ended',
        'can_accept_entries',
        'primary_image_url',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($giveaway) {
            if (empty($giveaway->slug)) {
                $giveaway->slug = Str::slug($giveaway->title);
            }
        });

        static::updating(function ($giveaway) {
            if ($giveaway->isDirty('title') && empty($giveaway->slug)) {
                $giveaway->slug = Str::slug($giveaway->title);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * Relationship: Giveaway belongs to a winner (nullable)
     */
    public function winner(): BelongsTo
    {
        return $this->belongsTo(GiveawayEntry::class, 'winner_id');
    }

    /**
     * Scope: Get only active giveaways
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    /**
     * Scope: Get upcoming giveaways
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now());
    }

    /**
     * Scope: Get ended giveaways
     */
    public function scopeEnded($query)
    {
        return $query->where(function ($q) {
            $q->where('status', self::STATUS_ENDED)
                ->orWhere('end_date', '<', now());
        });
    }

    /**
     * Scope: Get drafts
     */
    public function scopeDraft($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Get is_active attribute
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->isActive();
    }

    /**
     * Check if giveaway is currently active
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->start_date <= now()
            && $this->end_date >= now();
    }

    /**
     * Get has_ended attribute
     */
    public function getHasEndedAttribute(): bool
    {
        return $this->hasEnded();
    }

    /**
     * Check if raffle has ended
     */
    public function hasEnded(): bool
    {
        return $this->status === self::STATUS_ENDED || $this->end_date < now();
    }

    /**
     * Get can_accept_entries attribute
     */
    public function getCanAcceptEntriesAttribute(): bool
    {
        return $this->canAcceptEntries();
    }

    /**
     * Check if raffle can accept new entries
     */
    public function canAcceptEntries(): bool
    {
        return $this->isActive() && !$this->hasEnded();
    }

    /**
     * Get primary image URL
     */
    public function getPrimaryImageUrlAttribute(): ?string
    {
        $primaryImage = $this->images()->primary()->first();
        return $primaryImage ? $primaryImage->url : null;
    }

    /**
     * Polymorphic relationship: Giveaway has many images (prize photos)
     */
    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    /**
     * Check and update status based on current conditions
     */
    public function updateStatusIfNeeded(): void
    {
        // If a winner has been selected, ensure status is ended
        if ($this->winner_id && $this->status !== self::STATUS_ENDED) {
            $this->update(['status' => self::STATUS_ENDED]);
            return;
        }

        // If end date has passed, ensure status is ended
        if ($this->end_date < now() && $this->status !== self::STATUS_ENDED) {
            $this->update(['status' => self::STATUS_ENDED]);
            return;
        }

        // If currently active but dates don't match, update accordingly
        if ($this->status === self::STATUS_ACTIVE) {
            if ($this->start_date > now() || $this->end_date < now()) {
                $this->update(['status' => self::STATUS_DRAFT]);
            }
        }
    }

    /**
     * Get total entries count
     */
    public function getTotalEntriesAttribute(): int
    {
        return $this->entries()->count();
    }

    /**
     * Relationship: Giveaway has many entries
     */
    public function entries(): HasMany
    {
        return $this->hasMany(GiveawayEntry::class);
    }

    /**
     * Mark prize as claimed
     */
    public function markPrizeAsClaimed(): void
    {
        $this->update([
            'prize_claimed' => true,
            'prize_claimed_at' => now(),
        ]);
    }

    /**
     * Reject current winner and select a new one
     * Stores the rejection reason and selects a new winner
     * The rejected winner is permanently disqualified from winning again
     */
    public function rejectWinner(string $reason): ?GiveawayEntry
    {
        if (!$this->winner_id) {
            return null;
        }

        // Store the current winner for logging
        $rejectedWinner = $this->winner;

        // Mark the rejected winner as permanently disqualified
        if ($rejectedWinner) {
            $rejectedWinner->markAsRejected();
        }

        // Clear winner and store rejection reason
        $this->update([
            'winner_id' => null,
            'prize_claimed' => null,
            'prize_claimed_at' => null,
            'rejection_reason' => $reason,
            'status' => self::STATUS_ACTIVE, // Temporarily reactivate for winner selection
        ]);

        // Select a new winner (automatically excludes rejected entries)
        $newWinner = $this->selectWinner();

        return $newWinner;
    }

    /**
     * Select a random winner from entries
     */
    public function selectWinner(): ?GiveawayEntry
    {
        if ($this->winner_id) {
            return $this->winner;
        }

        // Get all eligible entries (excludes rejected and already-winner entries)
        $randomEntry = $this->entries()
            ->eligible()
            ->inRandomOrder()
            ->first();

        if ($randomEntry) {
            $randomEntry->markAsWinner();
            $this->update([
                'winner_id' => $randomEntry->id,
                'status' => self::STATUS_ENDED,
            ]);
            return $randomEntry;
        }

        return null;
    }
}
