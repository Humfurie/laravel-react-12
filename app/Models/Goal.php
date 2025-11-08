<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Goal extends Model
{
    use HasFactory, SoftDeletes;

    const PRIORITY_NONE = 'none';
    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';
    protected $table = 'goals';
    protected $fillable = [
        'user_id',
        'title',
        'notes',
        'completed',
        'completed_at',
        'is_public',
        'order',
        'priority',
        'due_date',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'is_public' => 'boolean',
        'completed_at' => 'datetime',
        'due_date' => 'datetime',
        'order' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Query Scopes
     */
    public function scopeIncomplete($query)
    {
        return $query->where('completed', false);
    }

    public function scopeCompleted($query)
    {
        return $query->where('completed', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('created_at', 'asc');
    }

    public function toggleCompletion(): void
    {
        if ($this->completed) {
            $this->markAsIncomplete();
        } else {
            $this->markAsCompleted();
        }
    }

    public function markAsIncomplete(): void
    {
        $this->update([
            'completed' => false,
            'completed_at' => null,
        ]);
    }

    /**
     * Methods
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    /**
     * Check if the authenticated user can delete this goal
     */
    public function canBeDeletedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        // Super admin can delete any goal
        if ($user->isAdmin()) {
            return true;
        }

        // User can delete their own goal if they have permission
        if ($this->user_id === $user->id && $user->hasPermission('goal', 'delete')) {
            return true;
        }

        return false;
    }

    /**
     * Check if the authenticated user can update this goal
     */
    public function canBeUpdatedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        // Super admin can update any goal
        if ($user->isAdmin()) {
            return true;
        }

        // Owners can update their own goals if they have permission
        return $this->user_id === $user->id && $user->hasPermission('goal', 'update');
    }
}
