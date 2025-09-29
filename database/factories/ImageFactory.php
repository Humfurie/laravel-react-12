<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Image>
 */
class ImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $imageNames = [
            'Living Room View',
            'Kitchen',
            'Master Bedroom',
            'Bathroom',
            'Exterior Front',
            'Backyard',
            'Dining Room',
            'Guest Bedroom',
            'Garage',
            'Pool Area'
        ];

        return [
            'name' => $this->faker->randomElement($imageNames),
            'path' => 'property-images/' . $this->faker->uuid() . '.jpg',
        ];
    }

    public function forProperty(\App\Models\Property $property): static
    {
        return $this->state(fn (array $attributes) => [
            'imageable_id' => $property->id,
            'imageable_type' => \App\Models\Property::class,
        ]);
    }
}
