<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expertise extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'image',
        'category_slug',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Get the full URL of the expertise image
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        // If it's already a full URL (starts with http), return as is
        if (str_starts_with($this->image, 'http')) {
            return $this->image;
        }

        // Otherwise, use Laravel's asset helper for local files
        return asset($this->image);
    }

    /**
     * Get the category name from slug
     */
    public function getCategoryNameAttribute(): string
    {
        return match ($this->category_slug) {
            'be' => 'Backend',
            'fe' => 'Frontend',
            'td' => 'Tools & DevOps',
            default => $this->category_slug,
        };
    }

    /**
     * Scope to get active expertises
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get expertises ordered by their order column
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc')->orderBy('created_at', 'asc');
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, string $categorySlug)
    {
        return $query->where('category_slug', $categorySlug);
    }
}
