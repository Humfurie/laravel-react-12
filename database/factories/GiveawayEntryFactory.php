<?php

namespace Database\Factories;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GiveawayEntry>
 */
class GiveawayEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generate Filipino-style name
        $firstName = fake()->randomElement([
            'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena',
            'Miguel', 'Sofia', 'Antonio', 'Carmen', 'Luis', 'Isabel', 'Fernando',
            'Patricia', 'Ramon', 'Teresa', 'Gabriel', 'Luz', 'Rafael', 'Dolores',
        ]);

        $lastName = fake()->randomElement([
            'Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Ramos', 'Mendoza', 'Flores',
            'Gonzales', 'Torres', 'Rivera', 'Lopez', 'Aquino', 'Morales', 'Castro',
            'Villanueva', 'Bautista', 'Santiago', 'Fernandez', 'Martinez', 'Rosario',
        ]);

        return [
            'giveaway_id' => Giveaway::factory(),
            'name' => $firstName . ' ' . $lastName,
            'phone' => '+639' . fake()->numerify('#########'), // +639XXXXXXXXX format
            'facebook_url' => fake()->randomElement([
                'https://facebook.com/' . strtolower($firstName) . '.' . strtolower(str_replace(' ', '', $lastName)),
                'https://www.facebook.com/' . strtolower($firstName) . strtolower(str_replace(' ', '', $lastName)),
                'https://fb.com/' . strtolower($firstName) . '.' . strtolower(str_replace(' ', '', $lastName)) . fake()->numberBetween(1, 99),
            ]),
            'status' => GiveawayEntry::STATUS_PENDING,
            'entry_date' => now(),
        ];
    }

    /**
     * Indicate that the entry is pending
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => GiveawayEntry::STATUS_PENDING,
        ]);
    }

    /**
     * Indicate that the entry is verified
     */
    public function verified(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => GiveawayEntry::STATUS_VERIFIED,
        ]);
    }

    /**
     * Indicate that the entry is a winner
     */
    public function winner(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => GiveawayEntry::STATUS_WINNER,
        ]);
    }

    /**
     * Indicate that the entry is rejected
     */
    public function rejected(): static
    {
        return $this->state(fn(array $attributes) => [
            'status' => GiveawayEntry::STATUS_REJECTED,
        ]);
    }

    /**
     * Create an entry for a specific giveaway
     */
    public function forGiveaway(Giveaway|int $giveaway): static
    {
        return $this->state(fn(array $attributes) => [
            'giveaway_id' => $giveaway instanceof Giveaway ? $giveaway->id : $giveaway,
        ]);
    }
}
