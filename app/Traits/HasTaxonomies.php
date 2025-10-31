<?php

namespace App\Traits;

use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use InvalidArgumentException;

trait HasTaxonomies
{
    /**
     * Get all taxonomies configured for this model with their terms.
     * Only returns taxonomies that are either:
     * 1. Bound to this model class, OR
     * 2. Not bound to any model (shared taxonomies)
     */
    public function getConfiguredTaxonomies()
    {
        $taxonomySlugs = $this->taxonomies();

        if (empty($taxonomySlugs)) {
            return collect();
        }

        $modelClass = get_class($this);

        return Taxonomy::whereIn('slug', $taxonomySlugs)
            ->with('terms', 'models')
            ->get()
            ->filter(function ($taxonomy) use ($modelClass) {
                // Include if taxonomy is available for this model
                return $taxonomy->isAvailableFor($modelClass);
            })
            ->values();
    }

    /**
     * Define which taxonomies this model uses.
     * Override this method in your model to specify custom taxonomies.
     * By default, uses convention: {model-name}-categories
     *
     * @return array Array of taxonomy slugs
     */
    public function taxonomies(): array
    {
        // Convention-based: model name + "-categories"
        // e.g., Blog -> blog-categories, Expertise -> expertise-categories
        $modelName = strtolower(class_basename($this));
        return ["{$modelName}-categories"];
    }

    /**
     * Get the IDs of currently assigned terms for this model.
     */
    public function getAssignedTermIds(): array
    {
        return $this->taxonomyTerms()->pluck('taxonomy_terms.id')->toArray();
    }

    public function taxonomyTerms(): MorphToMany
    {
        return $this->morphToMany(TaxonomyTerm::class, 'taxonomable');
    }

    public function getTermsByTaxonomy(string $taxonomySlug)
    {
        return $this->taxonomyTerms()
            ->whereHas('taxonomy', function ($query) use ($taxonomySlug) {
                $query->where('slug', $taxonomySlug);
            })
            ->get();
    }

    public function attachTerms(array $termIds): void
    {
        $this->validateTermIds($termIds);
        $this->taxonomyTerms()->syncWithoutDetaching($termIds);
    }

    /**
     * Validate that term IDs belong to taxonomies available for this model.
     *
     * @param array $termIds
     * @throws InvalidArgumentException
     */
    public function validateTermIds(array $termIds): void
    {
        if (empty($termIds)) {
            return;
        }

        $modelClass = get_class($this);

        // Get the terms with their taxonomy and taxonomy's model bindings
        $terms = TaxonomyTerm::whereIn('id', $termIds)
            ->with(['taxonomy.models'])
            ->get();

        foreach ($terms as $term) {
            if (!$term->taxonomy->isAvailableFor($modelClass)) {
                $modelName = class_basename($modelClass);
                $boundTo = $term->taxonomy->isBoundToModels()
                    ? 'bound to: ' . implode(', ', $term->taxonomy->getModelNames())
                    : 'not bound to any model';

                throw new InvalidArgumentException(
                    "Taxonomy term '{$term->name}' (from taxonomy '{$term->taxonomy->name}') " .
                    "cannot be used with {$modelName} model. " .
                    "This taxonomy is {$boundTo}."
                );
            }
        }
    }

    public function detachTerms(array $termIds): void
    {
        // No validation needed for detaching
        $this->taxonomyTerms()->detach($termIds);
    }

    public function syncTerms(array $termIds): void
    {
        $this->validateTermIds($termIds);
        $this->taxonomyTerms()->sync($termIds);
    }

    public function syncTermsByTaxonomy(string $taxonomySlug, array $termIds): void
    {
        $taxonomy = Taxonomy::where('slug', $taxonomySlug)->first();

        if (!$taxonomy) {
            return;
        }

        // Validate that the taxonomy is available for this model
        $modelClass = get_class($this);
        if (!$taxonomy->isAvailableFor($modelClass)) {
            $modelName = class_basename($modelClass);
            throw new InvalidArgumentException(
                "Taxonomy '{$taxonomy->name}' is not available for {$modelName} model."
            );
        }

        // Validate term IDs
        $this->validateTermIds($termIds);

        // Get existing term IDs for this taxonomy
        $existingTermIds = $this->taxonomyTerms()
            ->where('taxonomy_id', $taxonomy->id)
            ->pluck('taxonomy_terms.id')
            ->toArray();

        // Detach old terms from this taxonomy
        $this->taxonomyTerms()->detach($existingTermIds);

        // Attach new terms
        $this->taxonomyTerms()->attach($termIds);
    }

    public function hasTerms(array $termIds): bool
    {
        return $this->taxonomyTerms()->whereIn('taxonomy_terms.id', $termIds)->exists();
    }

    public function hasTerm(int $termId): bool
    {
        return $this->taxonomyTerms()->where('taxonomy_terms.id', $termId)->exists();
    }
}
