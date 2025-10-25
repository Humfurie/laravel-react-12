<?php

namespace App\Services;

use App\Models\Image;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageService
{
    /**
     * Thumbnail sizes configuration
     */
    const SIZES = [
        'small' => 300,
        'medium' => 800,
        'large' => 1200,
    ];

    protected ImageManager $imageManager;

    public function __construct()
    {
        // Initialize Intervention Image with GD driver
        $this->imageManager = new ImageManager(new Driver);
    }

    /**
     * Reorder images for a model
     *
     * @param array $imageOrders Array of ['id' => order] mappings
     */
    public function reorder(Model $model, array $imageOrders): void
    {
        foreach ($imageOrders as $imageData) {
            $model->images()
                ->where('id', $imageData['id'])
                ->update(['order' => $imageData['order']]);
        }
    }

    /**
     * Delete an image and all its thumbnails
     */
    public function delete(Image $image): void
    {
        $image->delete();
        // Physical file deletion is handled by the Image model's boot method
    }

    /**
     * Set an image as primary for its parent model
     */
    public function setPrimary(Image $image): void
    {
        $image->setPrimary();
    }

    /**
     * Upload multiple images at once
     *
     * @param array $files Array of UploadedFile objects
     * @return array Array of created Image models
     */
    public function uploadMultiple(array $files, Model $model, string $directory = 'property-images'): array
    {
        $images = [];
        $isPrimary = $model->images()->count() === 0; // First image is primary

        foreach ($files as $index => $file) {
            $images[] = $this->upload(
                $file,
                $model,
                $directory,
                $index === 0 && $isPrimary
            );
        }

        return $images;
    }

    /**
     * Upload an image with thumbnail generation
     *
     * @param Model $model The model to attach the image to (polymorphic)
     * @param string $directory Base directory for storage
     * @param bool $isPrimary Mark this image as primary
     */
    public function upload(
        UploadedFile $file,
        Model  $model,
        string $directory = 'property-images',
        bool   $isPrimary = false,
        ?int   $order = null
    ): Image
    {
        // Generate unique filename with .webp extension
        $filename = time() . '_' . Str::random(10) . '.webp';

        // Convert and store the image as WebP
        $path = $this->convertToWebP($file, $directory, $filename);

        // Generate thumbnails
        $thumbnailPaths = $this->generateThumbnails($file, $directory, $filename);

        // Get the next order number for this model's images
        if ($order === null) {
            $currentMaxOrder = $model->images()->max('order');
            $order = $currentMaxOrder === null ? 0 : $currentMaxOrder + 1;
        }

        // If this should be primary, unset other primary images first
        if ($isPrimary) {
            $model->images()->update(['is_primary' => false]);
            $order = 0;
        }

        // Get the file size of the converted WebP image
        $fileSize = Storage::disk('public')->size($path);

        // Create the image record
        $image = $model->images()->create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'filename' => $filename,
            'mime_type' => 'image/webp',
            'size' => $fileSize,
            'order' => $order,
            'is_primary' => $isPrimary,
            'sizes' => $thumbnailPaths,
        ]);

        return $image;
    }

    /**
     * Convert an uploaded file to WebP format
     *
     * @param UploadedFile $file The uploaded file
     * @param string $directory Storage directory
     * @param string $filename Target filename (should have .webp extension)
     * @return string The storage path of the converted image
     */
    protected function convertToWebP(UploadedFile $file, string $directory, string $filename): string
    {
        // Load the image
        $image = $this->imageManager->read($file->path());

        // Encode as WebP with quality 85 (good balance between quality and file size)
        $encodedImage = $image->toWebp(85);

        // Store using Laravel's Storage facade (works with both real and fake storage)
        $path = $directory . '/' . $filename;
        Storage::disk('public')->put($path, (string)$encodedImage);

        return $path;
    }

    /**
     * Generate thumbnail images at different sizes
     *
     * @return array Array of size => path mappings
     */
    protected function generateThumbnails(UploadedFile $file, string $directory, string $originalFilename): array
    {
        $thumbnailPaths = [];

        // Load the image
        $image = $this->imageManager->read($file->path());

        foreach (self::SIZES as $sizeName => $maxWidth) {
            // Create thumbnail directory
            $thumbnailDir = $directory . '/thumbs/' . $sizeName;
            // Use .webp extension for thumbnails
            $thumbnailFilename = pathinfo($originalFilename, PATHINFO_FILENAME) . '_' . $sizeName . '.webp';

            // Resize image maintaining aspect ratio
            $thumbnail = clone $image;
            $thumbnail->scale(width: $maxWidth);

            // Encode as WebP with quality 85
            $encodedThumbnail = $thumbnail->toWebp(85);

            // Generate the path
            $thumbnailPath = $thumbnailDir . '/' . $thumbnailFilename;

            // Store using Laravel's Storage facade (works with both real and fake storage)
            Storage::disk('public')->put($thumbnailPath, (string)$encodedThumbnail);

            $thumbnailPaths[$sizeName] = $thumbnailPath;
        }

        return $thumbnailPaths;
    }

    /**
     * Get the image manager instance
     */
    public function getImageManager(): ImageManager
    {
        return $this->imageManager;
    }
}
