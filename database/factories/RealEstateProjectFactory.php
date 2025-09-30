<?php

namespace Database\Factories;

use App\Models\Developer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RealEstateProject>
 */
class RealEstateProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $projectNames = [
            'The Residences at Greenbelt',
            'One Ayala',
            'Uptown Ritz',
            'Newport City',
            'Eastwood City',
            'The Fort Residences',
            'Azure Urban Resort',
            'Mckinley Hill',
            'Alabang West',
            'Vertis North'
        ];

        $projectTypes = ['condominium', 'townhouse', 'subdivision', 'mixed_use'];

        return [
            'developer_id' => Developer::factory(),
            'name' => $this->faker->randomElement($projectNames) . ' ' . $this->faker->numberBetween(1000, 9999),
            'slug' => null, // Will be auto-generated from name
            'description' => $this->faker->paragraphs(3, true),
            'project_type' => $this->faker->randomElement($projectTypes),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->randomElement(['Makati', 'BGC', 'Ortigas', 'Alabang', 'Quezon City', 'Pasig', 'Mandaluyong', 'Paranaque']),
            'province' => $this->faker->randomElement(['Metro Manila', 'Rizal', 'Laguna', 'Cavite']),
            'region' => 'NCR',
            'country' => 'Philippines',
            'postal_code' => (string) $this->faker->numberBetween(1000, 1800),
            'latitude' => $this->faker->latitude(14.4, 14.8), // Metro Manila area
            'longitude' => $this->faker->longitude(120.9, 121.2), // Metro Manila area
            'completion_year' => $this->faker->numberBetween(2025, 2030),
            'status' => $this->faker->randomElement(['pre-selling', 'ready_for_occupancy']),
            'total_units' => $this->faker->numberBetween(50, 2000),
            'total_floors' => $this->faker->numberBetween(10, 60),
            'amenities' => $this->faker->randomElements([
                'Swimming Pool', 'Gym', 'Function Room', 'Sky Garden', 'Playground',
                'Basketball Court', 'Tennis Court', 'Jogging Path', 'Security', 'Covered Parking',
                'Shopping Center', 'Business Center', 'Spa', 'Game Room', 'Library'
            ], $this->faker->numberBetween(5, 10)),
            'images' => null, // Will be handled by polymorphic relationship
            'virtual_tour_url' => $this->faker->optional(0.3)->url(),
            'featured' => $this->faker->boolean(20),
        ];
    }

    public function condominium(): static
    {
        return $this->state(fn (array $attributes) => [
            'project_type' => 'condominium',
            'total_floors' => $this->faker->numberBetween(20, 60),
            'total_units' => $this->faker->numberBetween(200, 2000),
        ]);
    }

    public function townhouse(): static
    {
        return $this->state(fn (array $attributes) => [
            'project_type' => 'townhouse',
            'total_floors' => $this->faker->numberBetween(2, 4),
            'total_units' => $this->faker->numberBetween(50, 300),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
