<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
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
            'slug' => $this->slug,
            'description' => $this->description,
            'project_type' => $this->project_type,

            // Location
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'region' => $this->region,
            'country' => $this->country,
            'postal_code' => $this->postal_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'full_address' => $this->full_address,

            // Project Details
            'turnover_date' => $this->turnover_date,
            'completion_year' => $this->completion_year,
            'status' => $this->status,
            'total_units' => $this->total_units,
            'total_floors' => $this->total_floors,
            'amenities' => $this->amenities ?? [],
            'virtual_tour_url' => $this->virtual_tour_url,
            'featured' => $this->featured,

            // Images - when loaded as relationship, format them properly
            'images' => ImageResource::collection($this->whenLoaded('images')),
            // For backward compatibility with frontend expecting URL array
            'images_urls' => $this->when($this->relationLoaded('images'), function () {
                return $this->images->pluck('url')->values()->all();
            }),
            'featured_image' => $this->when($this->relationLoaded('images'), function () {
                $primary = $this->images->firstWhere('is_primary', true);

                return $primary ? $primary->url : null;
            }),

            // Statistics
            'available_units_count' => $this->available_units_count,

            // Relationships
            'developer' => new DeveloperResource($this->whenLoaded('developer')),
            'properties' => PropertyResource::collection($this->whenLoaded('properties')),

            // Timestamps
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
