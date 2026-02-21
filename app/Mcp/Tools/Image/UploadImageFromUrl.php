<?php

namespace App\Mcp\Tools\Image;

use App\Models\Blog;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

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

    public function schema(JsonSchema $schema): array
    {
        return [
            'url' => $schema->string()->description('HTTPS image URL to download')->required(),
            'blog_id' => $schema->integer()->description('Blog ID to attach image to (optional)'),
            'blog_slug' => $schema->string()->description('Blog slug to attach image to (optional)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $arguments = $request->all();
        $url = $arguments['url'] ?? '';

        if (! str_starts_with($url, 'https://')) {
            return Response::error('URL must use HTTPS.');
        }

        try {
            $response = Http::timeout(15)->maxRedirects(3)->get($url);
        } catch (\Throwable $e) {
            return Response::error('Failed to download image: '.$e->getMessage());
        }

        if (! $response->successful()) {
            return Response::error('Download failed with HTTP status '.$response->status().'.');
        }

        $contentType = $response->header('Content-Type');
        $mimeType = strtolower(explode(';', $contentType)[0]);

        if (! isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
            return Response::error("Invalid content type: {$mimeType}. Allowed: jpeg, png, gif, webp.");
        }

        $body = $response->body();

        if (strlen($body) > self::MAX_SIZE_BYTES) {
            return Response::error('Image exceeds 5MB size limit.');
        }

        $extension = self::ALLOWED_MIME_TYPES[$mimeType];
        $filename = time().'_'.Str::random(10).'.'.$extension;
        $storagePath = 'blog-images/'.$filename;

        $stored = Storage::disk('minio')->put($storagePath, $body);

        if (! $stored) {
            return Response::error('Failed to store image in MinIO.');
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

        return Response::json([
            'path' => $publicPath,
            'size' => strlen($body),
            'mime_type' => $mimeType,
            'blog_updated' => $blogUpdated,
        ]);
    }
}
