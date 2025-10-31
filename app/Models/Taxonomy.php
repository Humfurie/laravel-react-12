<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Taxonomy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($taxonomy) {
            if (empty($taxonomy->slug)) {
                $taxonomy->slug = Str::slug($taxonomy->name);
            }
        });
    }

    public function terms(): HasMany
    {
        return $this->hasMany(TaxonomyTerm::class)->orderBy('order');
    }

    /**
     * Check if this taxonomy is available for a specific model class.
     *
     * @param string $modelClass The fully qualified model class name
     * @return bool
     */
    public function isAvailableFor(string $modelClass): bool
    {
        // If taxonomy has no model bindings, it's available for all models
        if (!$this->isBoundToModels()) {
            return true;
        }

        // Check if the model class is in the bound models
        return $this->models()->where('model_class', $modelClass)->exists();
    }

    /**
     * Check if this taxonomy is bound to any model classes.
     *
     * @return bool
     */
    public function isBoundToModels(): bool
    {
        return $this->models()->exists();
    }

    /**
     * Get the model bindings for this taxonomy.
     */
    public function models(): HasMany
    {
        return $this->hasMany(TaxonomyModel::class);
    }

    /**
     * Get human-readable model names for display.
     *
     * @return array
     */
    public function getModelNames(): array
    {
        return collect($this->getModelClasses())
            ->map(function ($class) {
                // Convert 'App\Models\Blog' to 'Blog'
                return class_basename($class);
            })
            ->toArray();
    }

    /**
     * Get array of model classes this taxonomy is bound to.
     *
     * @return array
     */
    public function getModelClasses(): array
    {
        return $this->models()->pluck('model_class')->toArray();
    }
}
