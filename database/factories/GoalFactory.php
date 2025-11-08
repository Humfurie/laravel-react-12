<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Goal>
 */
class GoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(),
            'notes' => fake()->optional()->paragraph(),
            'completed' => false,
            'completed_at' => null,
            'is_public' => fake()->boolean(30), // 30% chance of being public
            'order' => 0,
            'priority' => fake()->randomElement(['none', 'low', 'medium', 'high']),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
        ];
    }

    /**
     * Indicate that the goal is completed.
     */
    public function completed(): static
    {
        return $this->state(fn(array $attributes) => [
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the goal is public.
     */
    public function public(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_public' => true,
        ]);
    }

    /**
     * Indicate that the goal is private.
     */
    public function private(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_public' => false,
        ]);
    }

    /**
     * Indicate that the goal is incomplete.
     */
    public function incomplete(): static
    {
        return $this->state(fn(array $attributes) => [
            'completed' => false,
            'completed_at' => null,
        ]);
    }
}
