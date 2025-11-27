<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogLocation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'blog_id',
        'latitude',
        'longitude',
        'title',
        'description',
        'address',
        'order',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'order' => 'integer',
    ];

    protected $appends = ['primary_image_url'];

    public function blog(): BelongsTo
    {
        return $this->belongsTo(Blog::class);
    }

    /**
     * Polymorphic relationship to images - reuses existing Image model
     */
    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable')->ordered();
    }

    public function getPrimaryImageUrlAttribute(): ?string
    {
        return $this->images()->where('is_primary', true)->first()?->url
            ?? $this->images()->first()?->url;
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}
