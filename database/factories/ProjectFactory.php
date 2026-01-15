<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'slug' => fake()->unique()->slug(),
            'description' => fake()->paragraphs(3, true),
            'short_description' => fake()->sentence(),
            'category' => fake()->randomElement([
                Project::CATEGORY_WEB_APP,
                Project::CATEGORY_MOBILE_APP,
                Project::CATEGORY_API,
                Project::CATEGORY_LIBRARY,
                Project::CATEGORY_CLI,
                Project::CATEGORY_DESIGN,
            ]),
            'tech_stack' => fake()->randomElements(['Laravel', 'React', 'Vue', 'TypeScript', 'PHP', 'Node.js'], 3),
            'links' => [
                ['type' => 'live', 'url' => fake()->url()],
            ],
            'github_repo' => 'https://github.com/'.fake()->userName().'/'.fake()->slug(),
            'status' => fake()->randomElement([
                Project::STATUS_LIVE,
                Project::STATUS_DEVELOPMENT,
                Project::STATUS_MAINTENANCE,
                Project::STATUS_ARCHIVED,
            ]),
            'is_featured' => false,
            'is_public' => true,
            'metrics' => null,
            'started_at' => fake()->dateTimeBetween('-2 years', '-6 months'),
            'completed_at' => fake()->optional()->dateTimeBetween('-6 months', 'now'),
            'sort_order' => fake()->numberBetween(1, 100),
            'view_count' => fake()->numberBetween(0, 1000),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'featured_at' => now(),
        ]);
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => true,
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => false,
        ]);
    }

    public function live(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Project::STATUS_LIVE,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Project::STATUS_ARCHIVED,
        ]);
    }

    public function inDevelopment(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Project::STATUS_DEVELOPMENT,
        ]);
    }
}
