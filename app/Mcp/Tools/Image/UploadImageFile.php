<?php

namespace App\Mcp\Tools\Image;

use App\Models\Blog;
use App\Models\Expertise;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;

class UploadImageFile extends Tool
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
        return 'Upload an image to storage from raw base64-encoded bytes. Use this when you have image data directly (e.g. a local file) rather than a remote URL. Optionally attach it to a blog post (via blog_id or blog_slug) or an expertise item (via expertise_id). Returns the hosted path.';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'base64' => $schema->string()->description('Base64-encoded image bytes (standard or URL-safe encoding, with or without padding)')->required(),
            'filename' => $schema->string()->description('Desired filename including extension, e.g. "ph-money.jpg". Used as a hint — extension is verified against detected MIME type.'),
            'blog_id' => $schema->integer()->description('Blog ID to attach the image to as featured image (mutually exclusive with expertise_id)'),
            'blog_slug' => $schema->string()->description('Blog slug to attach the image to as featured image (mutually exclusive with expertise_id)'),
            'expertise_id' => $schema->integer()->description('Expertise ID to attach the image to (mutually exclusive with blog_id/blog_slug, stores in images/techstack/)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $b64 = $request->get('base64', '');
        if (empty($b64)) {
            return Response::error('base64 is required.');
        }

        // Decode — try standard then URL-safe variant
        $data = base64_decode($b64, strict: true);
        if ($data === false) {
            $data = base64_decode(strtr($b64, '-_', '+/'), strict: false);
        }
        if ($data === false || $data === '') {
            return Response::error('Invalid base64 data.');
        }

        if (strlen($data) > self::MAX_SIZE_BYTES) {
            return Response::error('Image exceeds 5MB size limit.');
        }

        // Detect MIME type from raw bytes — do not trust caller
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($data);

        if (! isset(self::ALLOWED_MIME_TYPES[$mimeType])) {
            return Response::error("Invalid content type: {$mimeType}. Allowed: jpeg, png, gif, webp.");
        }

        // Resolve optional targets before any I/O to avoid orphaned files
        $blogId = $request->get('blog_id');
        $blogSlug = $request->get('blog_slug');
        $expertiseId = $request->get('expertise_id');
        $hasBlogTarget = $blogId || $blogSlug;

        if ($hasBlogTarget && $expertiseId) {
            return Response::error('Provide blog_id/blog_slug or expertise_id, not both.');
        }

        $blog = null;
        if ($hasBlogTarget) {
            $blog = $blogId
                ? Blog::find($blogId)
                : Blog::where('slug', $blogSlug)->first();

            if (! $blog) {
                return Response::error('Blog not found.');
            }

            if ($blog->featured_image) {
                return Response::json([
                    'path' => null,
                    'size' => null,
                    'mime_type' => null,
                    'blog_updated' => 'skipped',
                    'expertise_updated' => 'none',
                ]);
            }
        }

        $expertise = null;
        if ($expertiseId) {
            $expertise = Expertise::find($expertiseId);

            if (! $expertise) {
                return Response::error('Expertise not found.');
            }

            if ($expertise->image) {
                return Response::json([
                    'path' => null,
                    'size' => null,
                    'mime_type' => null,
                    'blog_updated' => 'none',
                    'expertise_updated' => 'skipped',
                ]);
            }
        }

        $extension = self::ALLOWED_MIME_TYPES[$mimeType];
        $filename = time().'_'.Str::random(10).'.'.$extension;
        $directory = $expertise ? 'images/techstack' : 'blog-images';
        $storagePath = $directory.'/'.$filename;

        $stored = Storage::disk('minio')->put($storagePath, $data);
        if (! $stored) {
            return Response::error('Failed to store image in MinIO.');
        }

        $publicPath = '/storage/'.$storagePath;

        $blogUpdated = 'none';
        if ($blog) {
            $blog->update(['featured_image' => $publicPath]);
            $blogUpdated = 'updated';
        }

        $expertiseUpdated = 'none';
        if ($expertise) {
            $expertise->update(['image' => $publicPath]);
            $expertiseUpdated = 'updated';
        }

        return Response::json([
            'path' => $publicPath,
            'size' => strlen($data),
            'mime_type' => $mimeType,
            'blog_updated' => $blogUpdated,
            'expertise_updated' => $expertiseUpdated,
        ]);
    }
}
