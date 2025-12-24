<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommentReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'comment_id',
        'reported_by',
        'reason',
        'description',
        'status',
        'reviewed_by',
        'reviewed_at',
        'admin_notes',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the comment that was reported.
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }

    /**
     * Get the user who reported the comment.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Get the admin who reviewed the report.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope a query to only include pending reports.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to include all relationships needed for display.
     */
    public function scopeWithRelations($query)
    {
        return $query->with(['comment.user', 'comment.commentable', 'reporter', 'reviewer']);
    }

    /**
     * Mark the report as reviewed.
     */
    public function markAsReviewed(User $reviewer, string $action, ?string $notes = null): void
    {
        $this->update([
            'status' => $action === 'dismiss' ? 'dismissed' : 'actioned',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Get the reason label.
     */
    public function getReasonLabelAttribute(): string
    {
        return match ($this->reason) {
            'spam' => 'Spam',
            'harassment' => 'Harassment',
            'inappropriate' => 'Inappropriate Content',
            'misinformation' => 'Misinformation',
            'other' => 'Other',
            default => 'Unknown'
        };
    }

    /**
     * Get the status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pending Review',
            'reviewed' => 'Reviewed',
            'dismissed' => 'Dismissed',
            'actioned' => 'Action Taken',
            default => 'Unknown'
        };
    }
}
