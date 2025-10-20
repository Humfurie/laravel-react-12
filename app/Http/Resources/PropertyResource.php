<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,

            // Unit Details
            'unit_number' => $this->unit_number,
            'floor_level' => $this->floor_level,
            'building_phase' => $this->building_phase,
            'property_type' => $this->property_type,

            // Dimensions
            'floor_area' => $this->floor_area,
            'floor_area_unit' => $this->floor_area_unit,
            'formatted_floor_area' => $this->formatted_floor_area,
            'balcony_area' => $this->balcony_area,

            // Room Details
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'parking_spaces' => $this->parking_spaces,

            // Orientation & View
            'orientation' => $this->orientation,
            'view_type' => $this->view_type,

            // Status
            'listing_status' => $this->listing_status,
            'is_available' => $this->isAvailable(),
            'is_sold' => $this->isSold(),
            'is_reserved' => $this->isReserved(),

            // Features
            'features' => $this->features ?? [],
            'floor_plan_url' => $this->floor_plan_url,

            // Metadata
            'featured' => $this->featured,
            'view_count' => $this->view_count,

            // Relationships
            'project' => new ProjectResource($this->whenLoaded('project')),
            'pricing' => $this->whenLoaded('pricing'),
            'contacts' => $this->whenLoaded('contacts'),
            'images' => ImageResource::collection($this->whenLoaded('images')),
            'primary_image' => new ImageResource($this->whenLoaded('images', function () {
                return $this->images->firstWhere('is_primary', true);
            })),

            // Legacy/Compatibility fields (if needed)
            'status' => $this->status,
            'listing_type' => $this->listing_type,
            'price' => $this->price,
            'currency' => $this->currency,
            'formatted_price' => $this->formatted_price,
            'city' => $this->city,
            'state' => $this->state,
            'country' => $this->country,
            'postal_code' => $this->postal_code,
            'address' => $this->address,
            'full_address' => $this->full_address,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'listed_at' => $this->listed_at?->toDateTimeString(),

            // Timestamps
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'deleted_at' => $this->deleted_at?->toDateTimeString(),
        ];
    }
}
