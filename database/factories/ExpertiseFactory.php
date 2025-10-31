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
            'name' => fake()->words(2, true),
            'image' => 'storage/images/techstack/' . fake()->word() . '.png',
            'category_slug' => fake()->randomElement(['be', 'fe', 'td']),
            'order' => fake()->numberBetween(0, 100),
            'is_active' => fake()->boolean(80),
        ];
    }
}
