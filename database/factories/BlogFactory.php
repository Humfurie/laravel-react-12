<?php

namespace Database\Factories;

use App\Models\Blog;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Blog>
 */
class BlogFactory extends Factory
{
    protected $model = Blog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => $this->generateRichContent(),
            'excerpt' => fake()->text(150),
            'status' => fake()->randomElement(['draft', 'published', 'private']),
            'featured_image' => fake()->boolean(30) ? fake()->imageUrl(800, 600, 'technology') : null,
            'meta_data' => [
                'meta_title' => $title,
                'meta_description' => fake()->text(160),
                'meta_keywords' => implode(', ', fake()->words(5))
            ],
            'isPrimary' => fake()->boolean(20), // 20% chance of being primary
            'sort_order' => fake()->numberBetween(0, 100),
            'view_count' => fake()->numberBetween(0, 5000),
            'published_at' => fake()->boolean(70) ? fake()->dateTimeBetween('-6 months', 'now') : null,
        ];
    }

    /**
     * Generate rich HTML content with various elements
     */
    private function generateRichContent(): string
    {
        $paragraphs = [];

        // Add opening paragraph
        $paragraphs[] = '<p>' . fake()->paragraph(4) . '</p>';

        // Add heading
        $paragraphs[] = '<h2>' . fake()->sentence(3) . '</h2>';

        // Add more paragraphs
        for ($i = 0; $i < fake()->numberBetween(2, 4); $i++) {
            $paragraphs[] = '<p>' . fake()->paragraph(6) . '</p>';
        }

        // Sometimes add an image
        if (fake()->boolean(40)) {
            $paragraphs[] = '<p><img src="' . fake()->imageUrl(600, 400, 'technology') . '" alt="' . fake()->words(3, true) . '" /></p>';
        }

        // Add another heading
        $paragraphs[] = '<h3>' . fake()->sentence(2) . '</h3>';

        // Add list
        $listItems = array_map(fn($item) => '<li>' . $item . '</li>', fake()->sentences(4));
        $paragraphs[] = '<ul>' . implode('', $listItems) . '</ul>';

        // Add final paragraphs
        for ($i = 0; $i < fake()->numberBetween(1, 3); $i++) {
            $paragraphs[] = '<p>' . fake()->paragraph(5) . '</p>';
        }

        return implode("\n", $paragraphs);
    }

    /**
     * Indicate that the blog post is published.
     */
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
            'published_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ]);
    }

    /**
     * Indicate that the blog post is a draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    /**
     * Indicate that the blog post is primary/featured.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'isPrimary' => true,
            'status' => 'published',
            'published_at' => fake()->dateTimeBetween('-3 months', 'now'),
        ]);
    }

    /**
     * Indicate that the blog post has high view count.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'view_count' => fake()->numberBetween(1000, 10000),
        ]);
    }

    /**
     * Indicate that the blog post has no featured image.
     */
    public function withoutFeaturedImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured_image' => null,
        ]);
    }

    /**
     * Indicate that the blog post has a featured image.
     */
    public function withFeaturedImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured_image' => fake()->imageUrl(800, 600, 'technology'),
        ]);
    }
}
