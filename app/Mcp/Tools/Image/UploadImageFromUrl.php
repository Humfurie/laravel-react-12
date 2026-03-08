<?php

namespace App\Mcp\Tools\Image;

use App\Models\Blog;
use App\Models\Expertise;
use App\Models\Project;
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
        return 'Upload an image from a URL to storage. Use this to set blog featured images, expertise icons, or project thumbnails from real URLs. Provide blog_id/blog_slug, expertise_id, OR project_id — not more than one. Returns error if the specified target does not exist. Will not overwrite existing images — returns "skipped" if one already exists. Status fields return: "updated", "skipped", or "none".';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'url' => $schema->string()->description('HTTPS image URL to download')->required(),
            'blog_id' => $schema->integer()->description('Blog ID to attach image to (mutually exclusive with expertise_id and project_id)'),
            'blog_slug' => $schema->string()->description('Blog slug to attach image to (mutually exclusive with expertise_id and project_id)'),
            'expertise_id' => $schema->integer()->description('Expertise ID to attach image to (mutually exclusive with blog_id/blog_slug and project_id, stores in images/techstack/)'),
            'project_id' => $schema->integer()->description('Project ID to attach image to as primary thumbnail (mutually exclusive with blog_id/blog_slug and expertise_id)'),
        ];
    }

    public function handle(Request $request): Response
    {
        $url = $request->get('url', '');

        if (! str_starts_with($url, 'https://')) {
            return Response::error('URL must use HTTPS.');
        }

        // Resolve targets before any I/O to avoid orphaned files in storage
        $blogId = $request->get('blog_id');
        $blogSlug = $request->get('blog_slug');
        $expertiseId = $request->get('expertise_id');
        $projectId = $request->get('project_id');
        $hasBlogTarget = $blogId || $blogSlug;

        $exclusiveCount = (int) $hasBlogTarget + (int) (bool) $expertiseId + (int) (bool) $projectId;
        if ($exclusiveCount > 1) {
            return Response::error('Provide only one of: blog_id/blog_slug, expertise_id, or project_id.');
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
                    'path' => null, 'size' => null, 'mime_type' => null,
                    'blog_updated' => 'skipped', 'expertise_updated' => 'none', 'project_updated' => 'none',
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
                    'path' => null, 'size' => null, 'mime_type' => null,
                    'blog_updated' => 'none', 'expertise_updated' => 'skipped', 'project_updated' => 'none',
                ]);
            }
        }

        $project = null;
        if ($projectId) {
            $project = Project::find($projectId);

            if (! $project) {
                return Response::error('Project not found.');
            }

            if ($project->primaryImage()->exists()) {
                return Response::json([
                    'path' => null, 'size' => null, 'mime_type' => null,
                    'blog_updated' => 'none', 'expertise_updated' => 'none', 'project_updated' => 'skipped',
                ]);
            }
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
        $directory = match (true) {
            $expertise !== null => 'images/techstack',
            $project !== null   => 'project-images',
            default             => 'blog-images',
        };
        $storagePath = $directory.'/'.$filename;

        $disk = Storage::disk(config('filesystems.default'));
        $stored = $disk->put($storagePath, $body);

        if (! $stored) {
            return Response::error('Failed to store image.');
        }

        $publicPath = $disk->url($storagePath);

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

        $projectUpdated = 'none';
        if ($project) {
            $project->images()->create([
                'name' => $filename,
                'path' => $storagePath,
                'filename' => $filename,
                'mime_type' => $mimeType,
                'size' => strlen($body),
                'order' => 0,
                'is_primary' => true,
                'sizes' => [],
            ]);
            $projectUpdated = 'updated';
        }

        return Response::json([
            'path' => $publicPath,
            'size' => strlen($body),
            'mime_type' => $mimeType,
            'blog_updated' => $blogUpdated,
            'expertise_updated' => $expertiseUpdated,
            'project_updated' => $projectUpdated,
        ]);
    }
}
