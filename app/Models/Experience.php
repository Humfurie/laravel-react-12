<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Experience extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'position',
        'company',
        'location',
        'description',
        'start_month',
        'start_year',
        'end_month',
        'end_year',
        'is_current_position',
        'display_order',
        'is_public',
    ];

    protected $casts = [
        'description' => 'array', // JSON cast for description bullet points
        'is_current_position' => 'boolean',
        'is_public' => 'boolean',
        'start_month' => 'integer',
        'start_year' => 'integer',
        'end_month' => 'integer',
        'end_year' => 'integer',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Get the user that owns the experience.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the experience's image (polymorphic relationship).
     */
    public function image(): MorphOne
    {
        return $this->morphOne(Image::class, 'imageable');
    }

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute(): ?string
    {
        return $this->image?->url;
    }

    /**
     * Scope to order by display order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('start_year', 'desc')->orderBy('start_month', 'desc');
    }

    /**
     * Scope to get current positions.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current_position', true);
    }
}
