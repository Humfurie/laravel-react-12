<?php

namespace App\Services;

use App\Models\Image;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
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
        Model        $model,
        string       $directory = 'property-images',
        bool         $isPrimary = false,
        ?int         $order = null
    ): Image
    {
        // Generate unique filename
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();

        // Store the original file
        $path = $file->storeAs($directory, $filename, 'public');

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

        // Create the image record
        $image = $model->images()->create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'filename' => $filename,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'order' => $order,
            'is_primary' => $isPrimary,
            'sizes' => $thumbnailPaths,
        ]);

        return $image;
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
            $thumbnailFilename = pathinfo($originalFilename, PATHINFO_FILENAME) . '_' . $sizeName . '.' . pathinfo($originalFilename, PATHINFO_EXTENSION);

            // Resize image maintaining aspect ratio
            $thumbnail = clone $image;
            $thumbnail->scale(width: $maxWidth);

            // Generate the path
            $thumbnailPath = $thumbnailDir . '/' . $thumbnailFilename;
            $fullPath = storage_path('app/public/' . $thumbnailPath);

            // Ensure directory exists
            if (!file_exists(dirname($fullPath))) {
                mkdir(dirname($fullPath), 0755, true);
            }

            // Save the thumbnail
            $thumbnail->save($fullPath);

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
