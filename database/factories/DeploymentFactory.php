<?php

namespace Database\Factories;

use App\Models\Deployment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Deployment>
 */
class DeploymentFactory extends Factory
{
    protected $model = Deployment::class;

    public function definition(): array
    {
        return [
            'title' => fake()->company().' Website',
            'description' => fake()->paragraphs(2, true),
            'client_name' => fake()->company(),
            'client_type' => fake()->randomElement([
                Deployment::CLIENT_TYPE_FAMILY,
                Deployment::CLIENT_TYPE_FRIEND,
                Deployment::CLIENT_TYPE_BUSINESS,
                Deployment::CLIENT_TYPE_PERSONAL,
            ]),
            'industry' => fake()->randomElement(['Technology', 'Healthcare', 'E-commerce', 'Education', null]),
            'tech_stack' => fake()->randomElements(['Laravel', 'React', 'Vue', 'TypeScript', 'PHP', 'Node.js'], 3),
            'challenges_solved' => [
                fake()->sentence(),
                fake()->sentence(),
            ],
            'live_url' => fake()->url(),
            'demo_url' => fake()->optional()->url(),
            'project_id' => null,
            'is_featured' => false,
            'is_public' => true,
            'deployed_at' => fake()->dateTimeBetween('-2 years', 'now'),
            'status' => Deployment::STATUS_ACTIVE,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Deployment::STATUS_ACTIVE,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Deployment::STATUS_ARCHIVED,
        ]);
    }

    public function family(): static
    {
        return $this->state(fn (array $attributes) => [
            'client_type' => Deployment::CLIENT_TYPE_FAMILY,
        ]);
    }

    public function business(): static
    {
        return $this->state(fn (array $attributes) => [
            'client_type' => Deployment::CLIENT_TYPE_BUSINESS,
        ]);
    }
}
