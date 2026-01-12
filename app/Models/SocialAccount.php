<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Social Account Model
 *
 * Represents a connected social media account (YouTube, Facebook, Instagram, TikTok, Threads).
 * Users can connect multiple accounts per platform (e.g., 2 YouTube channels, 3 Instagram accounts).
 *
 * @property int $id
 * @property int $user_id
 * @property string $platform
 * @property string $platform_user_id
 * @property string|null $username
 * @property string|null $name
 * @property string|null $nickname
 * @property string|null $avatar_url
 * @property string $access_token
 * @property string|null $refresh_token
 * @property Carbon|null $token_expires_at
 * @property array|null $scopes
 * @property string $status
 * @property bool $is_default
 * @property array|null $metadata
 * @property Carbon|null $last_synced_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
class SocialAccount extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'platform',
        'platform_user_id',
        'username',
        'name',
        'nickname',
        'avatar_url',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'scopes',
        'status',
        'is_default',
        'metadata',
        'last_synced_at',
    ];

    /**
     * Get the user that owns this social account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all posts published through this social account.
     */
    public function socialPosts(): HasMany
    {
        return $this->hasMany(SocialPost::class);
    }

    /**
     * Get all metrics for this social account.
     */
    public function socialMetrics(): HasMany
    {
        return $this->hasMany(SocialMetric::class);
    }

    /**
     * Scope to filter accounts by platform.
     */
    public function scopePlatform($query, string $platform)
    {
        return $query->where('platform', $platform);
    }

    /**
     * Scope to filter active accounts only.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to filter expired accounts.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    /**
     * Scope to get default accounts for each platform.
     */
    public function scopeDefaults($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Check if the access token is expired or about to expire soon.
     */
    public function isTokenExpired(int $bufferMinutes = 5): bool
    {
        if (!$this->token_expires_at) {
            return false;
        }

        return $this->token_expires_at->subMinutes($bufferMinutes)->isPast();
    }

    /**
     * Get display name for the account (nickname or name or username).
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->nickname ?? $this->name ?? $this->username ?? 'Unknown Account';
    }

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'scopes' => 'array',
            'metadata' => 'array',
            'is_default' => 'boolean',
            'token_expires_at' => 'datetime',
            'last_synced_at' => 'datetime',
            'access_token' => 'encrypted', // Encrypt sensitive OAuth tokens
            'refresh_token' => 'encrypted', // Encrypt sensitive OAuth tokens
        ];
    }
}
