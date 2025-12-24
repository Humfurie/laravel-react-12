<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommentReport>
 */
class CommentReportFactory extends Factory
{
    protected $model = CommentReport::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'comment_id' => Comment::factory(),
            'reported_by' => User::factory(),
            'reason' => fake()->randomElement(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
            'description' => fake()->optional()->paragraph(),
            'status' => 'pending',
            'reviewed_by' => null,
            'reviewed_at' => null,
            'admin_notes' => null,
        ];
    }

    /**
     * Indicate that the report has been reviewed.
     */
    public function reviewed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'reviewed',
            'reviewed_by' => User::factory(),
            'reviewed_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'admin_notes' => fake()->optional()->sentence(),
        ]);
    }

    /**
     * Indicate that the report has been dismissed.
     */
    public function dismissed(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'dismissed',
            'reviewed_by' => User::factory(),
            'reviewed_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'admin_notes' => fake()->optional()->sentence(),
        ]);
    }

    /**
     * Indicate that the report has been actioned.
     */
    public function actioned(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'actioned',
            'reviewed_by' => User::factory(),
            'reviewed_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'admin_notes' => fake()->optional()->sentence(),
        ]);
    }

    /**
     * Indicate that the report is for spam.
     */
    public function spam(): static
    {
        return $this->state(fn(array $attributes) => [
            'reason' => 'spam',
            'description' => fake()->sentence() . ' This looks like spam content.',
        ]);
    }

    /**
     * Indicate that the report is for harassment.
     */
    public function harassment(): static
    {
        return $this->state(fn(array $attributes) => [
            'reason' => 'harassment',
            'description' => fake()->sentence() . ' This content contains harassment.',
        ]);
    }
}
