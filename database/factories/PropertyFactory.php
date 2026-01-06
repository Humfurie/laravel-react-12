<?php

namespace Database\Factories;

use App\Models\Property;
use App\Models\RealEstateProject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Property>
 */
class PropertyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $propertyTypes = [
            Property::PROPERTY_TYPE_STUDIO,
            Property::PROPERTY_TYPE_1BR,
            Property::PROPERTY_TYPE_2BR,
            Property::PROPERTY_TYPE_3BR,
            Property::PROPERTY_TYPE_PENTHOUSE
        ];

        $listingStatuses = [
            Property::LISTING_STATUS_AVAILABLE,
            Property::LISTING_STATUS_RESERVED,
            Property::LISTING_STATUS_SOLD,
            Property::LISTING_STATUS_NOT_AVAILABLE
        ];

        $orientations = [
            Property::ORIENTATION_NORTH,
            Property::ORIENTATION_SOUTH,
            Property::ORIENTATION_EAST,
            Property::ORIENTATION_WEST
        ];

        $propertyType = $this->faker->randomElement($propertyTypes);

        // Determine bedrooms based on property type
        $bedrooms = match($propertyType) {
            Property::PROPERTY_TYPE_STUDIO => 0,
            Property::PROPERTY_TYPE_1BR => 1,
            Property::PROPERTY_TYPE_2BR => 2,
            Property::PROPERTY_TYPE_3BR => 3,
            Property::PROPERTY_TYPE_PENTHOUSE => $this->faker->numberBetween(2, 4),
            default => $this->faker->numberBetween(1, 3)
        };

        // Determine floor area based on property type
        $floorArea = match($propertyType) {
            Property::PROPERTY_TYPE_STUDIO => $this->faker->randomFloat(2, 20, 35),
            Property::PROPERTY_TYPE_1BR => $this->faker->randomFloat(2, 35, 60),
            Property::PROPERTY_TYPE_2BR => $this->faker->randomFloat(2, 60, 90),
            Property::PROPERTY_TYPE_3BR => $this->faker->randomFloat(2, 90, 150),
            Property::PROPERTY_TYPE_PENTHOUSE => $this->faker->randomFloat(2, 150, 300),
            default => $this->faker->randomFloat(2, 50, 100)
        };

        $title = $propertyType . ' Unit at ' . $this->faker->randomElement([
            'Luxury Tower', 'Premium Residences', 'Executive Suites', 'Metropolitan Plaza', 'Urban Heights'
        ]) . ' ' . $this->faker->numberBetween(1000, 9999);

        return [
            'project_id' => RealEstateProject::factory(),
            'title' => $title,
            'slug' => null, // Will be auto-generated
            'description' => $this->faker->optional(0.8)->paragraphs(2, true),
            'unit_number' => $this->faker->optional(0.9)->regexify('[0-9]{1,2}[A-F]{1}[0-9]{2}'),
            'floor_level' => $this->faker->numberBetween(3, 50),
            'building_phase' => $this->faker->optional(0.4)->randomElement(['Tower A', 'Tower B', 'Tower C', 'Phase 1', 'Phase 2']),
            'property_type' => $propertyType,
            'floor_area' => $floorArea,
            'floor_area_unit' => 'sqm',
            'balcony_area' => $this->faker->optional(0.7)->randomFloat(2, 3, 15),
            'bedrooms' => $bedrooms,
            'bathrooms' => $this->faker->randomFloat(1, 1, 3),
            'parking_spaces' => $this->faker->numberBetween(0, 2),
            'orientation' => $this->faker->optional(0.8)->randomElement($orientations),
            'view_type' => $this->faker->optional(0.6)->randomElement([
                'City View', 'Sea View', 'Garden View', 'Pool View', 'Golf View', 'Mountain View'
            ]),
            'listing_status' => Property::LISTING_STATUS_AVAILABLE, // Default to available
            'features' => $this->faker->randomElements([
                'Air Conditioning', 'Built-in Wardrobes', 'Balcony', 'Powder Room',
                'Service Area', 'Maid\'s Room', 'Walk-in Closet', 'Study Room',
                'Storage Room', 'Smart Home Ready'
            ], $this->faker->numberBetween(2, 5)),
            'floor_plan_url' => $this->faker->optional(0.3)->url(),
            'featured' => $this->faker->boolean(15), // 15% chance of being featured
            'view_count' => $this->faker->numberBetween(0, 500),
        ];
    }

    public function studio(): static
    {
        return $this->state(fn (array $attributes) => [
            'property_type' => Property::PROPERTY_TYPE_STUDIO,
            'bedrooms' => 0,
            'floor_area' => $this->faker->randomFloat(2, 20, 35),
        ]);
    }

    public function oneBR(): static
    {
        return $this->state(fn (array $attributes) => [
            'property_type' => Property::PROPERTY_TYPE_1BR,
            'bedrooms' => 1,
            'floor_area' => $this->faker->randomFloat(2, 35, 60),
        ]);
    }

    public function twoBR(): static
    {
        return $this->state(fn (array $attributes) => [
            'property_type' => Property::PROPERTY_TYPE_2BR,
            'bedrooms' => 2,
            'floor_area' => $this->faker->randomFloat(2, 60, 90),
        ]);
    }

    public function threeBR(): static
    {
        return $this->state(fn (array $attributes) => [
            'property_type' => Property::PROPERTY_TYPE_3BR,
            'bedrooms' => 3,
            'floor_area' => $this->faker->randomFloat(2, 90, 150),
        ]);
    }

    public function penthouse(): static
    {
        return $this->state(fn (array $attributes) => [
            'property_type' => Property::PROPERTY_TYPE_PENTHOUSE,
            'bedrooms' => $this->faker->numberBetween(2, 4),
            'floor_area' => $this->faker->randomFloat(2, 150, 300),
            'balcony_area' => $this->faker->randomFloat(2, 20, 50),
            'floor_level' => $this->faker->numberBetween(40, 60),
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'featured' => true,
        ]);
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'listing_status' => Property::LISTING_STATUS_AVAILABLE,
            'status' => 'available',
        ]);
    }

    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'listing_status' => Property::LISTING_STATUS_SOLD,
            'status' => 'sold',
        ]);
    }

    public function reserved(): static
    {
        return $this->state(fn (array $attributes) => [
            'listing_status' => Property::LISTING_STATUS_RESERVED,
        ]);
    }
}
