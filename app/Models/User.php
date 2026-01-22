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
use Illuminate\Support\Facades\Cache;
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
        'username',
        'email',
        'password',
        'mobile',
        'telephone',
        'bio',
        'avatar_url',
        'github_username',
        'google_id',
        'facebook_id',
        'github_id',
        'github_contributions',
        'github_synced_at',
        'social_links',
        'resume_path',
        'about_image_path',
        'profile_stats',
        'about',
        'headline',
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
                // Check for exact match in pivot table actions
                $subQuery->where('permissions.resource', $resource)
                    ->whereJsonContains('permission_role.actions', $action);
            })->orWhere(function ($subQuery) {
                // Check for wildcard permissions in pivot table
                $subQuery->where('permissions.resource', '*')
                    ->whereJsonContains('permission_role.actions', '*');
            })->orWhere(function ($subQuery) use ($resource) {
                // Check for resource wildcard (e.g., blog.*) in pivot table
                $subQuery->where('permissions.resource', $resource)
                    ->whereJsonContains('permission_role.actions', '*');
            })->orWhere(function ($subQuery) use ($action) {
                // Check for action wildcard (e.g., *.viewAny) in pivot table
                $subQuery->where('permissions.resource', '*')
                    ->whereJsonContains('permission_role.actions', $action);
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
        // Cache permissions for 5 minutes to avoid repeated queries
        return Cache::remember(
            'user_permissions_'.$this->id,
            now()->addMinutes(5),
            function () {
                // Eager load relationships to prevent N+1 queries
                $user = $this->load('roles.permissions');

                $resources = [
                    'developer',
                    'project',
                    'realestate-project',
                    'property',
                    'blog',
                    'giveaway',
                    'user',
                    'role',
                    'permission',
                    'experience',
                    'expertise',
                    'skills',
                    'technology',
                    'setting',
                    'about',
                ];

                $allPermissions = [];

                foreach ($resources as $resource) {
                    $allPermissions[$resource] = $this->getResourcePermissions($resource);
                }

                return $allPermissions;
            }
        );
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
            'github_contributions' => 'array',
            'github_synced_at' => 'datetime',
            'social_links' => 'array',
            'profile_stats' => 'array',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'username';
    }

    /**
     * Get total GitHub contribution count.
     */
    public function getContributionCountAttribute(): int
    {
        return $this->github_contributions['total_contributions'] ?? 0;
    }

    /**
     * Check if user has a linked GitHub account.
     */
    public function hasGithubLinked(): bool
    {
        return ! empty($this->github_id);
    }

    /**
     * Check if user has a linked Google account.
     */
    public function hasGoogleLinked(): bool
    {
        return ! empty($this->google_id);
    }

    /**
     * Check if user has a linked Facebook account.
     */
    public function hasFacebookLinked(): bool
    {
        return ! empty($this->facebook_id);
    }

    /**
     * Check if user signed up via social login (no password set).
     */
    public function isSocialOnlyUser(): bool
    {
        return ($this->google_id || $this->facebook_id || $this->github_id)
            && $this->password === null;
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
