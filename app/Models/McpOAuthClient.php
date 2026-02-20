<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class McpOAuthClient extends Model
{
    use HasUuids;

    protected $table = 'mcp_oauth_clients';

    protected $fillable = ['name', 'secret_hash', 'redirect_uris'];

    protected function casts(): array
    {
        return [
            'redirect_uris' => 'array',
        ];
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(McpOAuthToken::class, 'client_id');
    }
}
