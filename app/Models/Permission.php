<?php

namespace App\Models;

use Database\Factories\PermissionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permission extends Model
{
    /** @use HasFactory<PermissionFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'resource',
        'actions'
    ];

    protected $casts = [
        'actions' => 'json'
    ];


    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)
            ->withPivot('actions');
    }
}
