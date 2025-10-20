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
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
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

    public function hasRole(string|array $roles): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $roles = is_array($roles) ? $roles : [$roles];

        return $this->roles()->whereIn('slug', $roles)->exists();
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
                $subQuery->where('permissions.resource', $resource)
                    ->whereJsonContains('permissions.actions', $action);
            })->orWhere(function ($subQuery) {
                // Check for wildcard permissions
                $subQuery->where('permissions.resource', '*')
                    ->whereJsonContains('permissions.actions', '*');
            })->orWhere(function ($subQuery) use ($resource) {
                // Check for resource wildcard (e.g., blog.*)
                $subQuery->where('permissions.resource', $resource)
                    ->whereJsonContains('permissions.actions', '*');
            })->orWhere(function ($subQuery) use ($action) {
                // Check for action wildcard (e.g., *.viewAny)
                $subQuery->where('permissions.resource', '*')
                    ->whereJsonContains('permissions.actions', $action);
            });
        })->exists();
    }

    public function getResourcePermissions(string $resource): array
    {
        $actions = ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'];
        $permissions = [];

        foreach ($actions as $action) {
            $permissions[$action] = $this->hasPermission($resource, $action);
        }

        return $permissions;
    }

    public function getAllPermissions(): array
    {
        $resources = [
            'developer',
            'realestate-project',
            'property',
            'blog',
            'user',
            'role',
            'permission',
            'experience',
            'skills',
            'technology',
        ];
        $allPermissions = [];

        foreach ($resources as $resource) {
            $allPermissions[$resource] = $this->getResourcePermissions($resource);
        }

        return $allPermissions;
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

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'email' => $this->email,
            'name' => $this->name,
        ];
    }
}
