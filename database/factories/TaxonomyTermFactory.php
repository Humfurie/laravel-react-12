<?php

namespace Database\Factories;

use App\Models\Taxonomy;
use App\Models\TaxonomyTerm;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TaxonomyTerm>
 */
class TaxonomyTermFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(2, true);

        return [
            'taxonomy_id' => Taxonomy::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->optional()->sentence(),
            'order' => fake()->numberBetween(0, 100),
        ];
    }
}
