<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    const LISTING_STATUS_AVAILABLE = 'available';
    const LISTING_STATUS_RESERVED = 'reserved';
    const LISTING_STATUS_SOLD = 'sold';
    const LISTING_STATUS_NOT_AVAILABLE = 'not_available';

    const PROPERTY_TYPE_STUDIO = 'studio';
    const PROPERTY_TYPE_1BR = '1br';
    const PROPERTY_TYPE_2BR = '2br';
    const PROPERTY_TYPE_3BR = '3br';
    const PROPERTY_TYPE_PENTHOUSE = 'penthouse';

    const ORIENTATION_NORTH = 'North';
    const ORIENTATION_SOUTH = 'South';
    const ORIENTATION_EAST = 'East';
    const ORIENTATION_WEST = 'West';

    protected $fillable = [
        'project_id',
        'title',
        'slug',
        'description',
        'unit_number',
        'floor_level',
        'building_phase',
        'property_type',
        'floor_area',
        'floor_area_unit',
        'balcony_area',
        'bedrooms',
        'bathrooms',
        'parking_spaces',
        'orientation',
        'view_type',
        'listing_status',
        'features',
        'images',
        'floor_plan_url',
        'featured',
        'view_count',
        // Compatibility fields for tests
        'status',
        'listing_type',
        'price',
        'currency',
        'city',
        'state',
        'country',
        'postal_code',
        'address',
        'latitude',
        'longitude',
        'listed_at',
        'contact_name',
        'contact_email',
        'contact_phone',
    ];

    protected $casts = [
        'features' => 'array',
        'images' => 'array',
        'floor_area' => 'decimal:2',
        'balcony_area' => 'decimal:2',
        'bathrooms' => 'decimal:1',
        'featured' => 'boolean',
        'view_count' => 'integer',
        'bedrooms' => 'integer',
        'floor_level' => 'integer',
        'parking_spaces' => 'integer',
        'price' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'listed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($property) {
            if (empty($property->slug)) {
                $property->slug = Str::slug($property->title);
            }

            // Set listed_at if status is available
            if (($property->status === 'available' || $property->listing_status === 'available') && !$property->listed_at) {
                $property->listed_at = now();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(RealEstateProject::class, 'project_id');
    }

    public function pricing(): HasOne
    {
        return $this->hasOne(PropertyPricing::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where(function($q) {
            $q->where('listing_status', self::LISTING_STATUS_AVAILABLE)
              ->orWhere('status', 'available');
        });
    }

    public function scopeReserved($query)
    {
        return $query->where('listing_status', self::LISTING_STATUS_RESERVED);
    }

    public function scopeSold($query)
    {
        return $query->where(function($q) {
            $q->where('listing_status', self::LISTING_STATUS_SOLD)
              ->orWhere('status', 'sold');
        });
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('property_type', $type);
    }

    public function scopeByBedrooms($query, $bedrooms)
    {
        return $query->where('bedrooms', '>=', $bedrooms);
    }

    public function scopeByBathrooms($query, $bathrooms)
    {
        return $query->where('bathrooms', '>=', $bathrooms);
    }

    public function scopeByFloorArea($query, $minArea = null, $maxArea = null)
    {
        if ($minArea) {
            $query->where('floor_area', '>=', $minArea);
        }
        if ($maxArea) {
            $query->where('floor_area', '<=', $maxArea);
        }
        return $query;
    }

    public function scopeByFloor($query, $minFloor = null, $maxFloor = null)
    {
        if ($minFloor) {
            $query->where('floor_level', '>=', $minFloor);
        }
        if ($maxFloor) {
            $query->where('floor_level', '<=', $maxFloor);
        }
        return $query;
    }

    public function scopeByPriceRange($query, $minPrice = null, $maxPrice = null)
    {
        return $query->whereHas('pricing', function ($q) use ($minPrice, $maxPrice) {
            if ($minPrice) {
                $q->where('total_contract_price', '>=', $minPrice);
            }
            if ($maxPrice) {
                $q->where('total_contract_price', '<=', $maxPrice);
            }
        });
    }

    // Compatibility scopes for tests
    public function scopeForSale($query)
    {
        return $query->where('listing_type', 'sale');
    }

    public function scopeForRent($query)
    {
        return $query->where('listing_type', 'rent');
    }

    public function scopeInLocation($query, $location)
    {
        return $query->where('city', 'like', '%' . $location . '%');
    }

    public function scopePriceRange($query, $minPrice = null, $maxPrice = null)
    {
        if ($minPrice) {
            $query->where('price', '>=', $minPrice);
        }
        if ($maxPrice) {
            $query->where('price', '<=', $maxPrice);
        }
        return $query;
    }

    public function scopeBedroomsCount($query, $bedrooms)
    {
        return $query->where('bedrooms', '>=', $bedrooms);
    }

    // Accessors
    public function getFullTitleAttribute()
    {
        $parts = array_filter([
            $this->project->name ?? '',
            $this->building_phase,
            $this->unit_number ? "Unit {$this->unit_number}" : '',
        ]);

        return implode(' - ', $parts);
    }

    public function getFormattedFloorAreaAttribute()
    {
        return $this->floor_area ? number_format($this->floor_area, 2) . ' ' . $this->floor_area_unit : null;
    }

    public function getPrimaryContactAttribute()
    {
        return $this->contacts()->where('is_primary', true)->first();
    }

    // Compatibility accessors for tests
    public function getFormattedPriceAttribute()
    {
        if (!$this->price) {
            return null;
        }

        $currency = $this->currency ?? 'PHP';
        return number_format($this->price, 2) . ' ' . $currency;
    }

    public function getFullAddressAttribute()
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    // Helper methods
    public function isAvailable(): bool
    {
        return $this->listing_status === self::LISTING_STATUS_AVAILABLE;
    }

    public function isSold(): bool
    {
        return $this->listing_status === self::LISTING_STATUS_SOLD;
    }

    public function isReserved(): bool
    {
        return $this->listing_status === self::LISTING_STATUS_RESERVED;
    }
}
