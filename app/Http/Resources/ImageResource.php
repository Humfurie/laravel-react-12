<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'filename' => $this->filename,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'formatted_size' => $this->formatted_size,
            'order' => $this->order,
            'is_primary' => $this->is_primary,

            // Original image URL
            'url' => $this->url,
            'path' => $this->path,

            // Thumbnail URLs for all sizes
            'thumbnails' => $this->thumbnail_urls,

            // Individual thumbnail sizes for convenience
            'small_url' => $this->getThumbnailUrl('small'),
            'medium_url' => $this->getThumbnailUrl('medium'),
            'large_url' => $this->getThumbnailUrl('large'),

            // Timestamps
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
