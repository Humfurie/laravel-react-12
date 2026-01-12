<?php

namespace App\Services;

use Exception;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\FFMpeg;
use FFMpeg\FFProbe;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Video Processing Service
 *
 * Handles video processing operations using FFmpeg:
 * - Extracting video metadata (duration, resolution, codec, bitrate)
 * - Generating video thumbnails at specific timestamps
 * - Converting video formats (future enhancement)
 * - Optimizing videos for web playback (future enhancement)
 */
class VideoProcessingService
{
    /**
     * FFMpeg instance for video processing.
     */
    protected FFMpeg $ffmpeg;

    /**
     * FFProbe instance for metadata extraction.
     */
    protected FFProbe $ffprobe;

    /**
     * Initialize the video processing service.
     */
    public function __construct()
    {
        $this->ffmpeg = FFMpeg::create([
            'ffmpeg.binaries' => config('laravel-ffmpeg.ffmpeg.binaries', '/usr/bin/ffmpeg'),
            'ffprobe.binaries' => config('laravel-ffmpeg.ffprobe.binaries', '/usr/bin/ffprobe'),
            'timeout' => config('laravel-ffmpeg.ffmpeg.timeout', 3600),
            'ffmpeg.threads' => config('laravel-ffmpeg.ffmpeg.threads', 12),
        ]);

        $this->ffprobe = FFProbe::create([
            'ffprobe.binaries' => config('laravel-ffmpeg.ffprobe.binaries', '/usr/bin/ffprobe'),
            'timeout' => config('laravel-ffmpeg.ffprobe.timeout', 60),
        ]);
    }

    /**
     * Generate multiple thumbnails at different timestamps.
     *
     * Creates multiple preview images from the video at evenly distributed intervals.
     * Useful for letting users select their preferred thumbnail.
     *
     * @param string $videoPath Relative path to video file in storage
     * @param int $count Number of thumbnails to generate (default: 3)
     * @param string|null $disk Storage disk name (defaults to config value)
     * @return array Array of thumbnail paths
     *
     * @throws Exception If thumbnail generation fails
     */
    public function generateMultipleThumbnails(string $videoPath, int $count = 3, ?string $disk = null): array
    {
        try {
            $disk = $disk ?? config('social-media.video.storage_disk', 'public');

            // Get video duration to calculate timestamps
            $metadata = $this->extractMetadata($videoPath, $disk);
            $duration = $metadata['duration'];

            // Calculate evenly distributed timestamps
            $interval = $duration / ($count + 1);
            $thumbnails = [];

            for ($i = 1; $i <= $count; $i++) {
                $timestamp = (int)($interval * $i);
                $thumbnails[] = $this->generateThumbnail($videoPath, $timestamp, $disk);
            }

            Log::info('Multiple video thumbnails generated', [
                'video_path' => $videoPath,
                'count' => $count,
                'duration' => $duration,
            ]);

            return $thumbnails;
        } catch (Exception $e) {
            Log::error('Failed to generate multiple thumbnails', [
                'video_path' => $videoPath,
                'count' => $count,
                'error' => $e->getMessage(),
            ]);

            throw new Exception('Failed to generate multiple thumbnails: ' . $e->getMessage());
        }
    }

    /**
     * Extract comprehensive metadata from a video file.
     *
     * Returns information including:
     * - Duration in seconds
     * - Video resolution (width x height)
     * - Video codec
     * - Audio codec
     * - Bitrate
     * - Frame rate
     * - File format
     *
     * @param string $path Relative path to video file in storage
     * @param string|null $disk Storage disk name (defaults to config value)
     * @return array Video metadata
     *
     * @throws Exception If metadata extraction fails
     */
    public function extractMetadata(string $path, ?string $disk = null): array
    {
        try {
            $disk = $disk ?? config('social-media.video.storage_disk', 'public');
            $fullPath = Storage::disk($disk)->path($path);

            // Get video format information
            $format = $this->ffprobe->format($fullPath);

            // Get video stream information
            $videoStream = $this->ffprobe
                ->streams($fullPath)
                ->videos()
                ->first();

            // Get audio stream information (may not exist for some videos)
            $audioStream = $this->ffprobe
                ->streams($fullPath)
                ->audios()
                ->first();

            $metadata = [
                'duration' => (int)$format->get('duration'), // Duration in seconds
                'bitrate' => (int)$format->get('bit_rate'), // Bitrate in bits/s
                'format' => $format->get('format_name'), // Container format (e.g., mp4, mov)
                'size' => (int)$format->get('size'), // File size in bytes
            ];

            // Add video stream metadata if available
            if ($videoStream) {
                $metadata['width'] = (int)$videoStream->get('width');
                $metadata['height'] = (int)$videoStream->get('height');
                $metadata['codec'] = $videoStream->get('codec_name'); // Video codec (e.g., h264, vp9)
                $metadata['frame_rate'] = $this->parseFrameRate($videoStream->get('r_frame_rate')); // FPS
                $metadata['aspect_ratio'] = $videoStream->get('display_aspect_ratio');
            }

            // Add audio stream metadata if available
            if ($audioStream) {
                $metadata['audio_codec'] = $audioStream->get('codec_name'); // Audio codec (e.g., aac, mp3)
                $metadata['audio_sample_rate'] = (int)$audioStream->get('sample_rate'); // Sample rate in Hz
                $metadata['audio_channels'] = (int)$audioStream->get('channels'); // Audio channels (1=mono, 2=stereo)
            }

            Log::info('Video metadata extracted successfully', [
                'path' => $path,
                'duration' => $metadata['duration'],
                'resolution' => ($metadata['width'] ?? 0) . 'x' . ($metadata['height'] ?? 0),
            ]);

            return $metadata;
        } catch (Exception $e) {
            Log::error('Failed to extract video metadata', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            throw new Exception('Failed to extract video metadata: ' . $e->getMessage());
        }
    }

    /**
     * Parse FFmpeg frame rate string (e.g., "30000/1001" or "30") to decimal FPS.
     *
     * @param string|null $frameRate Frame rate string from FFProbe
     * @return float|null Frame rate as decimal (e.g., 29.97) or null if unavailable
     */
    protected function parseFrameRate(?string $frameRate): ?float
    {
        if (!$frameRate) {
            return null;
        }

        // Handle fraction format (e.g., "30000/1001")
        if (str_contains($frameRate, '/')) {
            [$numerator, $denominator] = explode('/', $frameRate);

            return $denominator > 0 ? (float)($numerator / $denominator) : null;
        }

        // Handle decimal format (e.g., "30.0")
        return (float)$frameRate;
    }

    /**
     * Generate a thumbnail image from a video at a specific timestamp.
     *
     * Creates a thumbnail image (JPEG) from the video at the specified time.
     * Useful for:
     * - Preview images for video posts
     * - Multiple thumbnails for user selection
     * - Animated GIF creation (future enhancement)
     *
     * @param string $videoPath Relative path to video file in storage
     * @param int $timeInSeconds Timestamp to capture (default: 2 seconds into video)
     * @param string|null $disk Storage disk name (defaults to config value)
     * @param int $quality JPEG quality (1-100, default: 90)
     * @return string Relative path to generated thumbnail in storage
     *
     * @throws Exception If thumbnail generation fails
     */
    public function generateThumbnail(
        string  $videoPath,
        int     $timeInSeconds = 2,
        ?string $disk = null,
        int     $quality = 90
    ): string
    {
        try {
            $disk = $disk ?? config('social-media.video.storage_disk', 'public');
            $fullVideoPath = Storage::disk($disk)->path($videoPath);

            // Open the video file
            $video = $this->ffmpeg->open($fullVideoPath);

            // Generate unique filename for thumbnail
            $thumbnailFilename = Str::uuid() . '.jpg';
            $thumbnailPath = config('social-media.video.storage_path', 'social-media/videos') . '/thumbnails/' . $thumbnailFilename;
            $fullThumbnailPath = Storage::disk($disk)->path($thumbnailPath);

            // Ensure thumbnails directory exists
            $thumbnailDir = dirname($fullThumbnailPath);
            if (!is_dir($thumbnailDir)) {
                mkdir($thumbnailDir, 0755, true);
            }

            // Create a frame at the specified timestamp
            $frame = $video->frame(TimeCode::fromSeconds($timeInSeconds));

            // Save the frame as JPEG with specified quality
            $frame->save($fullThumbnailPath, true, $quality);

            Log::info('Video thumbnail generated successfully', [
                'video_path' => $videoPath,
                'thumbnail_path' => $thumbnailPath,
                'timestamp' => $timeInSeconds,
            ]);

            return $thumbnailPath;
        } catch (Exception $e) {
            Log::error('Failed to generate video thumbnail', [
                'video_path' => $videoPath,
                'timestamp' => $timeInSeconds,
                'error' => $e->getMessage(),
            ]);

            throw new Exception('Failed to generate video thumbnail: ' . $e->getMessage());
        }
    }

    /**
     * Check if FFmpeg is available on the system.
     *
     * @return bool True if FFmpeg is installed and accessible
     */
    public function isAvailable(): bool
    {
        try {
            $this->ffprobe->version();

            return true;
        } catch (Exception $e) {
            Log::warning('FFmpeg is not available', [
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Get FFmpeg version information.
     *
     * @return string Version string
     */
    public function getVersion(): string
    {
        try {
            return $this->ffprobe->version();
        } catch (Exception $e) {
            return 'Unknown';
        }
    }
}
