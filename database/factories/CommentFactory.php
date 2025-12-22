<?php

namespace Database\Factories;

use App\Models\Blog;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
class CommentFactory extends Factory
{
    protected $model = Comment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'commentable_type' => Blog::class,
            'commentable_id' => Blog::factory(),
            'user_id' => User::factory(),
            'parent_id' => null,
            'content' => fake()->paragraph(),
            'status' => 'approved',
            'is_edited' => false,
            'edited_at' => null,
        ];
    }

    /**
     * Indicate that the comment is pending moderation.
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the comment is hidden.
     */
    public function hidden(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => 'hidden',
        ]);
    }

    /**
     * Indicate that the comment has been edited.
     */
    public function edited(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_edited' => true,
            'edited_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the comment is a reply to another comment.
     */
    public function reply(?int $parentId = null): static
    {
        return $this->state(fn(array $attributes) => [
            'parent_id' => $parentId ?? Comment::factory(),
        ]);
    }
}
