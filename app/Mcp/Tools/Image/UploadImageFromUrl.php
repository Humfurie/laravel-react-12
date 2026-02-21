<?php

namespace App\Mcp\Tools\Image;

use App\Models\Blog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\ToolInputSchema;
use Laravel\Mcp\Server\Tools\ToolResult;

class UploadImageFromUrl extends Tool
{
    private const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    private const ALLOWED_MIME_TYPES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];

    public function description(): string
    {
        return 'Upload an image from a URL to storage. Use this to set blog featured images from real URLs instead of fabricating paths.';
    }

    public function schema(ToolInputSchema $schema): ToolInputSchema
    {
        return $schema
            ->string('url')->description('HTTPS image URL to download')->required()
            ->integer('blog_id')->description('Blog ID to attach image to (optional)')
            ->string('blog_slug')->description('Blog slug to attach image to (optional)');
    }

    public function handle(array $arguments): ToolResult
    {
        $url = $arguments['url'] ?? '';

        if (! str_starts_with($url, 'https://')) {
            return ToolResult::error('URL must use HTTPS.');
        }

        try {
            $response = Http::timeout(15)->maxRedirects(3)->get($url);
        } catch (\Throwable $e) {
            return ToolResult::error('Failed to download image: '.$e->getMessage());
        }

        if (! $response->successful()) {
            return ToolResult::error('Download failed with HTTP status '.$response->status().'.');
        }

        $contentType = $response->header('Content-Type');
        $mimeType = strtolower(explode(';', $contentType)[0]);

        if (! isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
            return ToolResult::error("Invalid content type: {$mimeType}. Allowed: jpeg, png, gif, webp.");
        }

        $body = $response->body();

        if (strlen($body) > self::MAX_SIZE_BYTES) {
            return ToolResult::error('Image exceeds 5MB size limit.');
        }

        $extension = self::ALLOWED_MIME_TYPES[$mimeType];
        $filename = time().'_'.Str::random(10).'.'.$extension;
        $storagePath = 'blog-images/'.$filename;

        $stored = Storage::disk('minio')->put($storagePath, $body);

        if (! $stored) {
            return ToolResult::error('Failed to store image in MinIO.');
        }

        $publicPath = '/storage/'.$storagePath;

        $blogId = $arguments['blog_id'] ?? null;
        $blogSlug = $arguments['blog_slug'] ?? null;
        $blogUpdated = false;

        if ($blogId || $blogSlug) {
            $blog = $blogId
                ? Blog::find($blogId)
                : Blog::where('slug', $blogSlug)->first();

            if ($blog) {
                $blog->update(['featured_image' => $publicPath]);
                $blogUpdated = true;
            }
        }

        return ToolResult::json([
            'path' => $publicPath,
            'size' => strlen($body),
            'mime_type' => $mimeType,
            'blog_updated' => $blogUpdated,
        ]);
    }
}
