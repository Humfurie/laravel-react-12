<?php

namespace Database\Factories;

use App\Models\Expertise;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpertiseFactory extends Factory
{
    protected $model = Expertise::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'image' => fake()->imageUrl(),
            'category_slug' => fake()->randomElement(['be', 'fe', 'td']),
            'order' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }
}
