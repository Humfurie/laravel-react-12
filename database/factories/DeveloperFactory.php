<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Developer>
 */
class DeveloperFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $companyNames = [
            'DMCI Homes',
            'Ayala Land Premier',
            'Megaworld Corporation',
            'Vista Land & Lifescapes',
            'Robinsons Land',
            'Century Properties',
            'Filinvest Development',
            'Rockwell Land',
            'Alveo Land',
            'SMDC (SM Development Corporation)'
        ];

        return [
            'company_name' => $this->faker->randomElement($companyNames),
            'description' => $this->faker->paragraphs(2, true),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->randomElement(['Manila', 'Makati', 'BGC', 'Ortigas', 'Alabang', 'Quezon City', 'Pasig', 'Mandaluyong']),
            'province' => $this->faker->randomElement(['Metro Manila', 'Rizal', 'Laguna', 'Cavite', 'Bulacan']),
            'postal_code' => $this->faker->numberBetween(1000, 1800),
            'contact_person' => $this->faker->name(),
            'contact_email' => $this->faker->companyEmail(),
            'contact_phone' => $this->faker->regexify('\+63[0-9]{10}'),
            'website' => $this->faker->optional(0.8)->url(),
            'license_number' => $this->faker->regexify('[A-Z]{3}-[0-9]{6}-[0-9]{4}'),
            'established_year' => $this->faker->numberBetween(1980, 2020),
            'logo_url' => $this->faker->optional(0.6)->imageUrl(400, 200, 'business'),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
