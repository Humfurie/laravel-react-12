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
        'number_of_winners',
        'background_image',
        'status',
        'winner_id',
        'prize_claimed',
        'prize_claimed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'start_date' => 'datetime:Y-m-d\TH:i:sP',
        'end_date' => 'datetime:Y-m-d\TH:i:sP',
        'prize_claimed_at' => 'datetime',
        'prize_claimed' => 'boolean',
        'number_of_winners' => 'integer',
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
     * Relationship: Giveaway has many winners
     */
    public function winners(): HasMany
    {
        return $this->hasMany(GiveawayEntry::class)->where('status', 'winner');
    }

    /**
     * Get all comments for this giveaway.
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get only approved comments for this giveaway.
     */
    public function approvedComments(): MorphMany
    {
        return $this->comments()->where('status', 'approved');
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
     * Check if giveaway has ended
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
     * Check if giveaway can accept new entries
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
        // Check if all winners have been selected
        $requiredWinners = $this->number_of_winners ?? 1;
        $currentWinnersCount = $this->winners()->count();
        $hasAllWinners = $currentWinnersCount >= $requiredWinners;

        // If all winners have been selected, ensure status is ended
        if ($hasAllWinners && $this->status !== self::STATUS_ENDED) {
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
            // If end date has passed, mark as ended
            if ($this->end_date < now()) {
                $this->update(['status' => self::STATUS_ENDED]);
            } // If start date is in the future, revert to draft
            elseif ($this->start_date > now()) {
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

        // Store rejection reason
        $this->update([
            'rejection_reason' => $reason,
            'status' => self::STATUS_ACTIVE, // Temporarily reactivate for winner selection
        ]);

        // Select a replacement winner (automatically excludes rejected entries)
        // This will select ONE new winner to replace the rejected one
        $newWinner = $this->selectWinner();

        // If we got a new winner, update winner_id to the latest winner
        if ($newWinner) {
            $this->update([
                'winner_id' => $newWinner->id,
                'status' => self::STATUS_ENDED,
            ]);
        }

        return $newWinner;
    }

    /**
     * Select random winner(s) from entries
     * Supports multiple winners based on number_of_winners setting
     */
    public function selectWinner(): ?GiveawayEntry
    {
        // Check if we already have all winners selected
        $currentWinnersCount = $this->winners()->count();
        $requiredWinners = $this->number_of_winners ?? 1;

        if ($currentWinnersCount >= $requiredWinners) {
            return $this->winner;
        }

        // Calculate how many more winners we need
        $winnersToSelect = $requiredWinners - $currentWinnersCount;

        // Get ALL eligible entries (excludes rejected and already-winner entries)
        $eligibleEntries = $this->entries()
            ->eligible()
            ->get();

        if ($eligibleEntries->isEmpty()) {
            return null;
        }

        // Shuffle the collection in PHP for true randomization
        $shuffledEntries = $eligibleEntries->shuffle();

        // Take only the number of winners we need
        $selectedWinners = $shuffledEntries->take($winnersToSelect);

        $lastWinner = null;

        // Mark each selected entry as a winner
        foreach ($selectedWinners as $entry) {
            $entry->markAsWinner();
            $lastWinner = $entry;
        }

        // Update the primary winner_id to the last selected winner
        // and mark the giveaway as ended
        if ($lastWinner) {
            $this->update([
                'winner_id' => $lastWinner->id,
                'status' => self::STATUS_ENDED,
            ]);
        }

        return $lastWinner;
    }
}
