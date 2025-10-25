<?php

use App\Models\Image;
use App\Models\Property;
use App\Services\ImageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    $this->imageService = app(ImageService::class);
});

describe('WebP Conversion', function () {
    test('converts uploaded JPG images to WebP format', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('test-image.jpg', 800, 600);

        $image = $this->imageService->upload($file, $property, 'test-images');

        // Assert the filename has .webp extension
        expect($image->filename)->toEndWith('.webp');

        // Assert mime type is image/webp
        expect($image->mime_type)->toBe('image/webp');

        // Assert the file was stored with .webp extension
        expect($image->path)->toEndWith('.webp');

        // Verify file exists in storage
        Storage::disk('public')->assertExists($image->path);
    });

    test('converts uploaded PNG images to WebP format', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('test-image.png', 800, 600);

        $image = $this->imageService->upload($file, $property, 'test-images');

        expect($image->filename)->toEndWith('.webp');
        expect($image->mime_type)->toBe('image/webp');
        Storage::disk('public')->assertExists($image->path);
    });

    test('generates WebP thumbnails at different sizes', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('test-image.jpg', 1920, 1080);

        $image = $this->imageService->upload($file, $property, 'test-images');

        // Assert thumbnails were created
        expect($image->sizes)->toBeArray();
        expect($image->sizes)->toHaveKeys(['small', 'medium', 'large']);

        // Assert all thumbnails are WebP
        foreach ($image->sizes as $size => $path) {
            expect($path)->toEndWith('.webp');
            Storage::disk('public')->assertExists($path);
        }
    });

    test('stores correct file size for WebP images', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('test-image.jpg', 800, 600)->size(1024);

        $image = $this->imageService->upload($file, $property, 'test-images');

        // WebP file should have a size greater than 0
        expect($image->size)->toBeGreaterThan(0);
    });

    test('preserves original filename in name field', function () {
        $property = Property::factory()->create();
        $file = UploadedFile::fake()->image('my-beautiful-photo.jpg', 800, 600);

        $image = $this->imageService->upload($file, $property, 'test-images');

        // Original name should be preserved
        expect($image->name)->toBe('my-beautiful-photo.jpg');

        // But stored filename should be WebP
        expect($image->filename)->toEndWith('.webp');
    });
});

describe('Multiple Image Upload', function () {
    test('converts all images to WebP when uploading multiple', function () {
        $property = Property::factory()->create();
        $files = [
            UploadedFile::fake()->image('image1.jpg'),
            UploadedFile::fake()->image('image2.png'),
            UploadedFile::fake()->image('image3.jpg'),
        ];

        $images = $this->imageService->uploadMultiple($files, $property, 'test-images');

        expect($images)->toHaveCount(3);

        foreach ($images as $image) {
            expect($image->filename)->toEndWith('.webp');
            expect($image->mime_type)->toBe('image/webp');
            Storage::disk('public')->assertExists($image->path);
        }
    });

    test('first uploaded image is marked as primary', function () {
        $property = Property::factory()->create();
        $files = [
            UploadedFile::fake()->image('image1.jpg'),
            UploadedFile::fake()->image('image2.jpg'),
        ];

        $images = $this->imageService->uploadMultiple($files, $property, 'test-images');

        expect($images[0]->is_primary)->toBeTrue();
        expect($images[1]->is_primary)->toBeFalse();
    });
});

describe('Image Reordering', function () {
    test('can reorder images', function () {
        $property = Property::factory()->create();
        $image1 = Image::factory()->forProperty($property)->create(['order' => 0]);
        $image2 = Image::factory()->forProperty($property)->create(['order' => 1]);

        $this->imageService->reorder($property, [
            ['id' => $image1->id, 'order' => 1],
            ['id' => $image2->id, 'order' => 0],
        ]);

        expect($image1->fresh()->order)->toBe(1);
        expect($image2->fresh()->order)->toBe(0);
    });
});

describe('Primary Image Management', function () {
    test('can set image as primary', function () {
        $property = Property::factory()->create();
        $image1 = Image::factory()->forProperty($property)->create(['is_primary' => true]);
        $image2 = Image::factory()->forProperty($property)->create(['is_primary' => false]);

        $this->imageService->setPrimary($image2);

        expect($image1->fresh()->is_primary)->toBeFalse();
        expect($image2->fresh()->is_primary)->toBeTrue();
    });
});
