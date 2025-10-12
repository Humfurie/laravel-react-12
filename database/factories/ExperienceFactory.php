<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Experience>
 */
class ExperienceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startYear = fake()->numberBetween(2015, date('Y'));
        $startMonth = fake()->numberBetween(0, 11);
        $isCurrent = fake()->boolean(30); // 30% chance of being current

        return [
            'user_id' => User::factory(),
            'position' => fake()->jobTitle(),
            'company' => fake()->company(),
            'location' => fake()->city() . ', ' . fake()->country(),
            'description' => [
                fake()->sentence(12),
                fake()->sentence(15),
                fake()->sentence(10),
            ],
            'start_month' => $startMonth,
            'start_year' => $startYear,
            'end_month' => $isCurrent ? null : fake()->numberBetween(0, 11),
            'end_year' => $isCurrent ? null : fake()->numberBetween($startYear, date('Y')),
            'is_current_position' => $isCurrent,
            'display_order' => fake()->numberBetween(0, 10),
        ];
    }

    /**
     * Indicate that the position is current.
     */
    public function current(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_current_position' => true,
            'end_month' => null,
            'end_year' => null,
        ]);
    }

    /**
     * Indicate that the position has ended.
     */
    public function ended(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_current_position' => false,
            'end_month' => fake()->numberBetween(0, 11),
            'end_year' => fake()->numberBetween($attributes['start_year'], date('Y')),
        ]);
    }
}
