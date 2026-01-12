<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * Video Model
 *
 * Polymorphic model for storing uploaded video files and their metadata.
 * Similar to the existing Image model pattern but specifically for video content.
 *
 * @property int $id
 * @property string $name
 * @property string $path
 * @property string $filename
 * @property string $mime_type
 * @property int $size
 * @property int|null $duration
 * @property int|null $width
 * @property int|null $height
 * @property string $videoable_type
 * @property int $videoable_id
 * @property string $processing_status
 * @property string|null $thumbnail_path
 * @property array|null $metadata
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Carbon|null $deleted_at
 */
class Video extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'path',
        'filename',
        'mime_type',
        'size',
        'duration',
        'width',
        'height',
        'videoable_type',
        'videoable_id',
        'processing_status',
        'thumbnail_path',
        'metadata',
    ];

    /**
     * Boot method to handle model events.
     */
    protected static function booted(): void
    {
        // Automatically delete video file from storage when model is deleted
        static::deleting(function (Video $video) {
            if ($video->path && Storage::disk(config('social-media.video.storage_disk', 'public'))->exists($video->path)) {
                Storage::disk(config('social-media.video.storage_disk', 'public'))->delete($video->path);
            }

            // Also delete thumbnail if exists
            if ($video->thumbnail_path && Storage::disk(config('social-media.video.storage_disk', 'public'))->exists($video->thumbnail_path)) {
                Storage::disk(config('social-media.video.storage_disk', 'public'))->delete($video->thumbnail_path);
            }
        });
    }

    /**
     * Get the parent videoable model (SocialPost, etc.).
     */
    public function videoable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to filter videos by processing status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('processing_status', $status);
    }

    /**
     * Scope to filter pending videos.
     */
    public function scopePending($query)
    {
        return $query->where('processing_status', 'pending');
    }

    /**
     * Scope to filter processing videos.
     */
    public function scopeProcessing($query)
    {
        return $query->where('processing_status', 'processing');
    }

    /**
     * Scope to filter completed videos.
     */
    public function scopeCompleted($query)
    {
        return $query->where('processing_status', 'completed');
    }

    /**
     * Scope to filter failed videos.
     */
    public function scopeFailed($query)
    {
        return $query->where('processing_status', 'failed');
    }

    /**
     * Get the full URL to the video file.
     */
    public function getUrlAttribute(): string
    {
        $disk = Storage::disk(config('social-media.video.storage_disk', 'public'));

        // For local/public disks, return relative path
        if (in_array(config('social-media.video.storage_disk', 'public'), ['local', 'public'])) {
            return '/storage/' . $this->path;
        }

        // For cloud disks (S3, MinIO), return full URL
        return $disk->url($this->path);
    }

    /**
     * Get the full URL to the thumbnail.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (!$this->thumbnail_path) {
            return null;
        }

        $disk = Storage::disk(config('social-media.video.storage_disk', 'public'));

        // For local/public disks, return relative path
        if (in_array(config('social-media.video.storage_disk', 'public'), ['local', 'public'])) {
            return '/storage/' . $this->thumbnail_path;
        }

        // For cloud disks (S3, MinIO), return full URL
        return $disk->url($this->thumbnail_path);
    }

    /**
     * Get formatted file size (e.g., "1.5 MB").
     */
    public function getFormattedSizeAttribute(): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = $this->size;
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2) . ' ' . $units[$unitIndex];
    }

    /**
     * Get formatted duration (e.g., "3:45" or "1:23:45").
     */
    public function getFormattedDurationAttribute(): string
    {
        if (!$this->duration) {
            return '0:00';
        }

        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }

        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Check if video processing is complete.
     */
    public function isProcessed(): bool
    {
        return $this->processing_status === 'completed';
    }

    /**
     * Mark video as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['processing_status' => 'processing']);
    }

    /**
     * Mark video as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update(['processing_status' => 'completed']);
    }

    /**
     * Mark video as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['processing_status' => 'failed']);
    }

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'size' => 'integer',
            'duration' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }
}
