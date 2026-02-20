<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class McpOAuthToken extends Model
{
    use HasUuids;

    protected $table = 'mcp_oauth_tokens';

    protected $fillable = ['client_id', 'user_id', 'token_hash', 'expires_at'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(McpOAuthClient::class, 'client_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
