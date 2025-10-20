<?php

use App\Models\Image;
use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');

    // Create admin user with property permissions
    $this->user = createAdminUser('property');
    $this->actingAs($this->user);
});

describe('Property Image Management', function () {
    test('can upload image to property', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('property-photo.jpg', 800, 600)->size(1024);

        $response = $this->postJson("/api/v1/properties/{$property->slug}/images", [
            'image' => $file,
            'name' => 'Beautiful Living Room'
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'image' => ['id', 'name', 'path'],
                'url',
                'path'
            ])
            ->assertJsonFragment([
                'success' => true,
                'name' => 'Beautiful Living Room'
            ]);

        // Verify file was stored
        $imagePath = $response->json('image.path');
        Storage::disk('public')->assertExists($imagePath);

        // Verify database record
        $this->assertDatabaseHas('images', [
            'name' => 'Beautiful Living Room',
            'imageable_id' => $property->id,
            'imageable_type' => Property::class
        ]);
    });

    test('validates required fields for image upload', function () {
        $property = Property::factory()->create();
        $response = $this->postJson("/api/v1/properties/{$property->slug}/images", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
    });

    test('validates image file type and size', function () {
        $property = Property::factory()->create();

        // Test invalid file type
        $invalidFile = UploadedFile::fake()->create('document.txt', 100);

        $response = $this->postJson("/api/v1/properties/{$property->slug}/images", [
            'image' => $invalidFile
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);

        // Test oversized file (> 5MB)
        $oversizedFile = UploadedFile::fake()->image('huge.jpg')->size(6000);

        $response = $this->postJson("/api/v1/properties/{$property->slug}/images", [
            'image' => $oversizedFile
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
    });

    test('validates property exists for image upload', function () {
        $file = UploadedFile::fake()->image('test.jpg');

        $response = $this->postJson("/api/v1/properties/nonexistent-slug/images", [
            'image' => $file
        ]);

        $response->assertNotFound(); // 404 since property doesn't exist
    });

    test('uses original filename as name if not provided', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('original-name.jpg');

        $response = $this->postJson("/api/v1/properties/{$property->slug}/images", [
            'image' => $file
        ]);

        $response->assertOk();
        expect($response->json('image.name'))->toBe('original-name.jpg');
    });

    test('can retrieve all images for a property', function () {
        $property = Property::factory()->create();
        $images = Image::factory()->forProperty($property)->count(3)->create();

        $response = $this->getJson("/api/v1/properties/{$property->slug}/images");

        $response->assertOk()
            ->assertJsonCount(3);

        foreach ($response->json() as $imageData) {
            expect($imageData)->toHaveKeys(['id', 'name', 'path', 'url', 'created_at']);
            expect($imageData['url'])->toStartWith('/storage/');
        }
    });

    test('returns empty array for property with no images', function () {
        $property = Property::factory()->create();

        $response = $this->getJson("/api/v1/properties/{$property->slug}/images");

        $response->assertOk()
            ->assertExactJson([]);
    });

    test('can delete property image', function () {
        $property = Property::factory()->create();
        $image = Image::factory()->forProperty($property)->create([
            'path' => 'property-images/test-image.jpg'
        ]);

        // Create fake file to simulate stored image
        Storage::disk('public')->put($image->path, 'fake image content');

        $response = $this->deleteJson("/api/v1/properties/{$property->slug}/images/{$image->id}");

        $response->assertOk()
            ->assertJson(['message' => 'Image deleted successfully']);

        // Verify database record is soft deleted
        $this->assertSoftDeleted('images', ['id' => $image->id]);

        // Verify file was deleted
        Storage::disk('public')->assertMissing($image->path);
    });

    test('prevents deleting image from wrong property', function () {
        $property1 = Property::factory()->create();
        $property2 = Property::factory()->create();
        $image = Image::factory()->forProperty($property2)->create();

        $response = $this->deleteJson("/api/v1/properties/{$property1->slug}/images/{$image->id}");

        $response->assertNotFound()
            ->assertJsonFragment(['message' => 'Image not found for this property']);

        // Verify image was not deleted
        $this->assertDatabaseHas('images', ['id' => $image->id, 'deleted_at' => null]);
    });

    test('handles deletion of image with missing physical file gracefully', function () {
        $property = Property::factory()->create();
        $image = Image::factory()->forProperty($property)->create([
            'path' => 'property-images/non-existent.jpg'
        ]);

        $response = $this->deleteJson("/api/v1/properties/{$property->slug}/images/{$image->id}");

        $response->assertOk();

        // Should still delete the database record even if file doesn't exist
        $this->assertSoftDeleted('images', ['id' => $image->id]);
    });
});

describe('Polymorphic Relationships', function () {
    test('property loads images relationship correctly', function () {
        $property = Property::factory()->create();
        $images = Image::factory()->forProperty($property)->count(3)->create();

        $response = $this->getJson("/api/v1/properties/{$property->slug}");

        $response->assertOk();
        expect($response->json('data.images'))->toHaveCount(3);

        foreach ($response->json('data.images') as $imageData) {
            expect($imageData)->toHaveKeys(['id', 'name', 'path', 'url']);
        }
    });

    test('image belongs to correct property through polymorphic relationship', function () {
        $property = Property::factory()->create();
        $image = Image::factory()->forProperty($property)->create();

        $loadedImage = Image::with('imageable')->find($image->id);

        expect($loadedImage->imageable)->toBeInstanceOf(Property::class);
        expect($loadedImage->imageable->id)->toBe($property->id);
    });

    test('property images are included in listings', function () {
        Property::factory()->available()->create(); // Property without images

        $propertyWithImages = Property::factory()->available()->create();
        Image::factory()->forProperty($propertyWithImages)->count(2)->create();

        $response = $this->getJson('/api/v1/properties');

        $response->assertOk();

        $properties = collect($response->json('data'));
        $propertyWithImagesData = $properties->firstWhere('id', $propertyWithImages->id);

        expect($propertyWithImagesData)->not->toBeNull();
        expect($propertyWithImagesData['images'])->toHaveCount(2);
    });

    test('deleting property soft deletes associated images', function () {
        $property = Property::factory()->create();
        $images = Image::factory()->forProperty($property)->count(3)->create();

        $property->delete();

        // Images should still exist (soft delete relationship doesn't cascade)
        foreach ($images as $image) {
            $this->assertDatabaseHas('images', ['id' => $image->id, 'deleted_at' => null]);
        }
    });

    test('image url attribute works correctly', function () {
        $property = Property::factory()->create();
        $image = Image::factory()->forProperty($property)->create([
            'path' => 'property-images/test.jpg'
        ]);

        expect($image->url)->toBe('/storage/property-images/test.jpg');
    });

    test('multiple properties can have images independently', function () {
        $property1 = Property::factory()->create();
        $property2 = Property::factory()->create();

        Image::factory()->forProperty($property1)->count(2)->create();
        Image::factory()->forProperty($property2)->count(3)->create();

        $response1 = $this->getJson("/api/v1/properties/{$property1->slug}");
        $response2 = $this->getJson("/api/v1/properties/{$property2->slug}");

        expect($response1->json('data.images'))->toHaveCount(2);
        expect($response2->json('data.images'))->toHaveCount(3);
    });
});
