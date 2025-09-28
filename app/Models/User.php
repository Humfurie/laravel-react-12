<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'mobile',
        'telephone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected static function boot()
    {
        parent::boot();


    }

    public function isAdmin(): bool
    {
        return $this->id === 1;
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function hasPermission(string $resource, string $action): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->roles()->whereHas('permissions', function ($query) use ($resource, $action) {
            $query->where(function ($subQuery) use ($resource, $action) {
                // Check for exact match
                $subQuery->where('resource', $resource)
                         ->whereJsonContains('actions', $action);
            })->orWhere(function ($subQuery) use ($resource, $action) {
                // Check for wildcard permissions
                $subQuery->where('resource', '*')
                         ->whereJsonContains('actions', '*');
            })->orWhere(function ($subQuery) use ($resource, $action) {
                // Check for resource wildcard (e.g., blog.*)
                $subQuery->where('resource', $resource)
                         ->whereJsonContains('actions', '*');
            })->orWhere(function ($subQuery) use ($resource, $action) {
                // Check for action wildcard (e.g., *.viewAny)
                $subQuery->where('resource', '*')
                         ->whereJsonContains('actions', $action);
            });
        })->exists();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
