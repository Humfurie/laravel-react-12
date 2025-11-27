<?php

namespace Database\Factories;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Giveaway>
 */
class GiveawayFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = fake()->dateTimeBetween($startDate, '+2 months');

        return [
            'title' => fake()->randomElement([
                    'iPhone 15 Pro Max Giveaway',
                    'MacBook Air M3 Raffle',
                    'PlayStation 5 Bundle Giveaway',
                    'Samsung Galaxy S24 Ultra Raffle',
                    'AirPods Pro 2 Giveaway',
                    'Nintendo Switch OLED Giveaway',
                    'iPad Pro 12.9" Raffle',
                    'GoPro Hero 12 Giveaway',
                    'Sony WH-1000XM5 Headphones Raffle',
                    'Apple Watch Series 9 Giveaway',
                ]) . ' - ' . fake()->unique()->numberBetween(1000, 9999),
            'description' => fake()->randomElement([
                "How to Enter:\n1. Like our Facebook page\n2. Share this post publicly\n3. Tag 3 friends in the comments\n4. Fill out the entry form with your details\n\nWinner will be announced on the draw date!",
                "Entry Requirements:\n✅ Must follow our Facebook page\n✅ Share this giveaway post\n✅ Comment with your favorite feature\n✅ Complete the entry form\n\nGood luck to everyone!",
                "Join our amazing giveaway!\n\nSteps to enter:\n• Like and follow our page\n• Share this post with #Giveaway\n• Tag friends who might be interested\n• Submit your entry through the form\n\nDraw date is listed below!",
            ]),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'number_of_winners' => 1,
            'status' => Giveaway::STATUS_ACTIVE,
            'winner_id' => null,
            'prize_claimed' => false,
            'prize_claimed_at' => null,
            'rejection_reason' => null,
        ];
    }

    /**
     * Indicate that the giveaway is in draft status
     */
    public function draft(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Giveaway::STATUS_DRAFT,
            'start_date' => fake()->dateTimeBetween('+1 week', '+2 weeks'),
            'end_date' => fake()->dateTimeBetween('+3 weeks', '+1 month'),
        ]);
    }

    /**
     * Indicate that the giveaway is active
     */
    public function active(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Giveaway::STATUS_ACTIVE,
            'start_date' => fake()->dateTimeBetween('-1 week', 'now'),
            'end_date' => fake()->dateTimeBetween('+1 week', '+1 month'),
        ]);
    }

    /**
     * Indicate that the giveaway has ended
     */
    public function ended(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Giveaway::STATUS_ENDED,
            'start_date' => fake()->dateTimeBetween('-2 months', '-1 month'),
            'end_date' => fake()->dateTimeBetween('-1 month', '-1 week'),
        ]);
    }

    /**
     * Indicate that the giveaway is upcoming (not started yet)
     */
    public function upcoming(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Giveaway::STATUS_ACTIVE,
            'start_date' => fake()->dateTimeBetween('+1 week', '+2 weeks'),
            'end_date' => fake()->dateTimeBetween('+3 weeks', '+1 month'),
        ]);
    }

    /**
     * Indicate that the prize has been claimed
     */
    public function claimed(): static
    {
        return $this->withWinner()->state(fn(array $attributes) => [
            'prize_claimed' => true,
            'prize_claimed_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the giveaway has a winner
     */
    public function withWinner(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => Giveaway::STATUS_ENDED,
            'prize_claimed' => false,
        ])->afterCreating(function (Giveaway $giveaway) {
            // Create entries and select a winner
            GiveawayEntry::factory(10)->create([
                'giveaway_id' => $giveaway->id,
            ]);
            $giveaway->selectWinner();
        });
    }
}
