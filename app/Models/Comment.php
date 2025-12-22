<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'commentable_type',
        'commentable_id',
        'user_id',
        'parent_id',
        'content',
        'status',
    ];

    protected $guarded = [
        'id',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $with = ['user'];

    /**
     * Get the parent commentable model (Blog or Giveaway).
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that owns the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent comment (for replies).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Get the replies to this comment.
     * Note: Don't eager load replies recursively here to avoid N+1 issues.
     * Load explicitly in controllers when needed.
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    /**
     * Get all reports for this comment.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(CommentReport::class);
    }

    /**
     * Check if the comment is owned by the given user.
     */
    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    /**
     * Scope a query to only include approved comments.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include root comments (no parent).
     */
    public function scopeRootComments($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope a query to eager load replies with user relationship.
     *
     * WARNING: Only use this for shallow comment threads.
     * For deeply nested threads, use explicit eager loading in controllers.
     * This loads up to 3 levels to match validation limits.
     */
    public function scopeWithReplies($query)
    {
        return $query->with([
            'replies' => function ($q) {
                $q->where('status', 'approved');
            },
            'replies.user',
            'replies.replies' => function ($q) {
                $q->where('status', 'approved');
            },
            'replies.replies.user',
            'replies.replies.replies' => function ($q) {
                $q->where('status', 'approved');
            },
            'replies.replies.replies.user',
        ]);
    }

    /**
     * Get the formatted created_at date.
     */
    public function getCreatedAtHumanAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Get the edit status text.
     */
    public function getEditStatusAttribute(): ?string
    {
        if (!$this->is_edited) {
            return null;
        }

        return 'Edited ' . $this->edited_at->diffForHumans();
    }

    /**
     * Mark the comment as edited.
     */
    public function markAsEdited(): void
    {
        $this->update([
            'is_edited' => true,
            'edited_at' => now(),
        ]);
    }
}
