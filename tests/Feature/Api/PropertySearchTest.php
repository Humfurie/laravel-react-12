<?php

use App\Models\Property;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('Advanced Property Search', function () {
    test('location-based search with radius works correctly', function () {
        // Create properties at different coordinates
        Property::factory()->create([
            'title' => 'Close Property',
            'latitude' => 37.7749,  // San Francisco
            'longitude' => -122.4194,
            'status' => 'available'
        ]);

        Property::factory()->create([
            'title' => 'Far Property',
            'latitude' => 40.7128,  // New York
            'longitude' => -74.0060,
            'status' => 'available'
        ]);

        // Search within 100km of San Francisco
        $response = $this->postJson('/api/v1/properties-search', [
            'latitude' => 37.7749,
            'longitude' => -122.4194,
            'radius' => 100
        ]);

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.title'))->toBe('Close Property');
    });

    test('search without coordinates returns all available properties', function () {
        Property::factory()->available()->count(5)->create();
        Property::factory()->sold()->count(2)->create();

        $response = $this->postJson('/api/v1/properties-search');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(5);
    });

    test('search includes images in results', function () {
        $property = Property::factory()->available()->create();
        $property->images()->create([
            'name' => 'Test Image',
            'path' => 'property-images/test.jpg'
        ]);

        $response = $this->postJson('/api/v1/properties-search');

        $response->assertOk();
        expect($response->json('data.0.images'))->toHaveCount(1);
    });

    test('search respects pagination', function () {
        Property::factory()->available()->count(20)->create();

        $response = $this->postJson('/api/v1/properties-search', [
            'per_page' => 5
        ]);

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(5);
        expect($response->json('per_page'))->toBe(5);
    });
});

describe('Property Model Scopes', function () {
    test('available scope filters correctly', function () {
        Property::factory()->create(['status' => 'available', 'listing_status' => 'not_available']);
        Property::factory()->create(['status' => 'available', 'listing_status' => 'not_available']);
        Property::factory()->create(['status' => 'sold', 'listing_status' => 'not_available']);

        $availableCount = Property::available()->count();
        expect($availableCount)->toBe(2);
    });

    test('forSale scope filters correctly', function () {
        Property::factory()->create(['listing_type' => 'sale']);
        Property::factory()->create(['listing_type' => 'rent']);

        $forSaleCount = Property::forSale()->count();
        expect($forSaleCount)->toBe(1);
    });

    test('forRent scope filters correctly', function () {
        Property::factory()->create(['listing_type' => 'rent']);
        Property::factory()->create(['listing_type' => 'sale']);

        $forRentCount = Property::forRent()->count();
        expect($forRentCount)->toBe(1);
    });

    test('featured scope filters correctly', function () {
        Property::factory()->create(['featured' => true]);
        Property::factory()->create(['featured' => false]);

        $featuredCount = Property::featured()->count();
        expect($featuredCount)->toBe(1);
    });

    test('can chain scopes together', function () {
        Property::factory()->create(['status' => 'available', 'listing_type' => 'sale', 'listing_status' => 'not_available']);
        Property::factory()->create(['status' => 'sold', 'listing_type' => 'sale', 'listing_status' => 'not_available']);
        Property::factory()->create(['status' => 'available', 'listing_type' => 'rent', 'listing_status' => 'not_available']);

        $count = Property::available()->forSale()->count();
        expect($count)->toBe(1);
    });

    test('inLocation scope filters by city', function () {
        Property::factory()->create(['city' => 'San Francisco']);
        Property::factory()->create(['city' => 'Los Angeles']);

        $count = Property::inLocation('San Francisco')->count();
        expect($count)->toBe(1);
    });

    test('priceRange scope filters correctly', function () {
        Property::factory()->create(['price' => 100000]);
        Property::factory()->create(['price' => 500000]);
        Property::factory()->create(['price' => 1000000]);

        $count = Property::priceRange(200000, 800000)->count();
        expect($count)->toBe(1);
    });

    test('bedroomsCount scope filters correctly', function () {
        Property::factory()->create(['bedrooms' => 2]);
        Property::factory()->create(['bedrooms' => 3]);
        Property::factory()->create(['bedrooms' => 4]);

        $count = Property::bedroomsCount(3)->count();
        expect($count)->toBe(2); // Properties with 3 or more bedrooms
    });
});

describe('Property Model Attributes and Methods', function () {
    test('slug is automatically generated from title', function () {
        $propertyData = Property::factory()->make(['title' => 'Beautiful Test House'])->toArray();
        unset($propertyData['slug']); // Remove factory-generated slug

        $property = Property::create($propertyData);

        expect($property->slug)->toBe('beautiful-test-house');
    });

    test('getFormattedPriceAttribute returns formatted price', function () {
        $property = Property::factory()->create(['price' => 450000.50, 'currency' => 'PHP']);

        expect($property->formatted_price)->toBe('450,000.50 PHP');
    });

    test('getFullAddressAttribute returns complete address', function () {
        $property = Property::factory()->create([
            'address' => '123 Main St',
            'city' => 'San Francisco',
            'state' => 'CA',
            'postal_code' => '94105',
            'country' => 'USA'
        ]);

        expect($property->full_address)->toBe('123 Main St, San Francisco, CA, 94105, USA');
    });

    test('incrementViewCount increases view count', function () {
        $property = Property::factory()->create(['view_count' => 5]);

        $property->incrementViewCount();

        expect($property->fresh()->view_count)->toBe(6);
    });

    test('route key uses slug instead of id', function () {
        $property = Property::factory()->create(['slug' => 'test-property']);

        expect($property->getRouteKeyName())->toBe('slug');
    });

    test('listed_at is set automatically when status is available', function () {
        $property = new Property();
        $property->fill([
            'title' => 'Test Property',
            'status' => 'available',
            'description' => 'Test',
            'property_type' => 'house',
            'listing_type' => 'sale',
            'price' => 100000,
            'address' => 'Test Address',
            'city' => 'Test City',
            'state' => 'TS',
            'country' => 'USA',
            'postal_code' => '12345',
            'contact_name' => 'Test',
            'contact_email' => 'test@test.com',
            'contact_phone' => '123-456-7890'
        ]);

        $property->save();

        expect($property->listed_at)->not->toBeNull();
    });
});

describe('Edge Cases and Error Handling', function () {
    test('handles non-existent property gracefully', function () {
        $response = $this->getJson('/api/v1/properties/non-existent-slug');

        $response->assertNotFound();
    });

    test('handles invalid sort parameters gracefully', function () {
        Property::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/properties?sort_by=invalid_field');

        $response->assertOk();
        // Should fall back to default sorting
    });

    test('handles empty search results', function () {
        $response = $this->getJson('/api/v1/properties?search=nonexistentproperty');

        $response->assertOk();
        expect($response->json('data'))->toHaveCount(0);
        expect($response->json('total'))->toBe(0);
    });

    test('handles invalid coordinates in location search', function () {
        Property::factory()->available()->count(3)->create();

        $response = $this->postJson('/api/v1/properties-search', [
            'latitude' => 'invalid',
            'longitude' => 'invalid',
            'radius' => 10
        ]);

        // The API should validate the coordinates and return an error
        $response->assertStatus(422);
    });

    test('handles very large per_page values', function () {
        $response = $this->getJson('/api/v1/properties?per_page=1000');

        $response->assertOk();
        expect($response->json('per_page'))->toBe(50); // Should be capped at maximum
    });

    test('filters maintain data integrity', function () {
        // Create a project in TestCity since city filter searches through project relationship
        $testProject = \App\Models\RealEstateProject::factory()->create([
            'name' => 'Test Project in TestCity',
            'city' => 'TestCity'
        ]);

        Property::factory()->create([
            'project_id' => $testProject->id,
            'status' => 'available',
            'city' => 'TestCity',
            'listing_status' => 'not_available'
        ]);

        Property::factory()->create([
            'project_id' => $testProject->id,
            'status' => 'sold',
            'city' => 'TestCity',
            'listing_status' => 'not_available'
        ]);

        $response = $this->getJson('/api/v1/properties?city=TestCity');

        $response->assertOk();
        // Should only return available properties by default, even with city filter
        expect($response->json('data'))->toHaveCount(1);
        expect($response->json('data.0.status'))->toBe('available');
    });
});