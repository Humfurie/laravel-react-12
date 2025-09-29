<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

class RealEstateProject extends Model
{
    use HasFactory;

    protected $table = 'real_estate_projects';

    const PROJECT_TYPE_CONDOMINIUM = 'condominium';
    const PROJECT_TYPE_HOUSE_AND_LOT = 'house_and_lot';
    const PROJECT_TYPE_TOWNHOUSE = 'townhouse';
    const PROJECT_TYPE_COMMERCIAL = 'commercial';

    const STATUS_PRE_SELLING = 'pre-selling';
    const STATUS_READY_FOR_OCCUPANCY = 'ready_for_occupancy';
    const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'developer_id',
        'name',
        'slug',
        'description',
        'project_type',
        'address',
        'city',
        'province',
        'region',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'turnover_date',
        'completion_year',
        'status',
        'total_units',
        'total_floors',
        'amenities',
        'images',
        'virtual_tour_url',
        'featured',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'featured' => 'boolean',
        'completion_year' => 'integer',
        'total_units' => 'integer',
        'total_floors' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->name);
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function developer(): BelongsTo
    {
        return $this->belongsTo(Developer::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'project_id');
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    // Scopes
    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('project_type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeInLocation($query, $city = null, $province = null, $region = null)
    {
        if ($city) {
            $query->where('city', 'like', "%{$city}%");
        }
        if ($province) {
            $query->where('province', 'like', "%{$province}%");
        }
        if ($region) {
            $query->where('region', 'like', "%{$region}%");
        }
        return $query;
    }

    // Accessors
    public function getFullAddressAttribute()
    {
        return implode(', ', array_filter([
            $this->address,
            $this->city,
            $this->province,
            $this->region,
            $this->postal_code,
            $this->country
        ]));
    }

    public function getAvailableUnitsCountAttribute(): int
    {
        return $this->properties()->where('listing_status', 'available')->count();
    }
}
