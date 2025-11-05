<?php

namespace App\Services;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PropertyService
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Create a new property with related data
     */
    public function createProperty(array $data, array $pricingData = [], array $contactsData = []): Property
    {
        return DB::transaction(function () use ($data, $pricingData, $contactsData) {
            // Create the property
            $property = Property::create($data);

            // Create pricing if provided
            if (!empty($pricingData)) {
                $property->pricing()->create(array_merge(
                    $pricingData,
                    ['currency' => $pricingData['currency'] ?? 'PHP']
                ));
            }

            // Create contacts if provided
            if (!empty($contactsData)) {
                foreach ($contactsData as $contactData) {
                    $property->contacts()->create($contactData);
                }
            }

            return $property->load(['project.developer', 'pricing', 'contacts', 'images']);
        });
    }

    /**
     * Update a property and its related data
     */
    public function updateProperty(Property $property, array $data, ?array $pricingData = null, ?array $contactsData = null): Property
    {
        return DB::transaction(function () use ($property, $data, $pricingData, $contactsData) {
            // Update the property
            $property->update($data);

            // Update or create pricing
            if ($pricingData !== null) {
                if ($property->pricing) {
                    $property->pricing->update($pricingData);
                } else {
                    $property->pricing()->create(array_merge(
                        $pricingData,
                        ['currency' => $pricingData['currency'] ?? 'PHP']
                    ));
                }
            }

            // Update contacts (delete old and create new)
            if ($contactsData !== null) {
                $property->contacts()->delete();
                foreach ($contactsData as $contactData) {
                    $property->contacts()->create($contactData);
                }
            }

            return $property->fresh(['project.developer', 'pricing', 'contacts', 'images']);
        });
    }

    /**
     * Get filtered and paginated properties
     *
     * @return LengthAwarePaginator
     */
    public function getProperties(array $filters = [], int $perPage = 15)
    {
        $query = Property::query()->with(['project.developer', 'pricing', 'contacts', 'images']);

        // Apply filters
        $this->applyFilters($query, $filters);

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $allowedSorts = ['created_at', 'title', 'bedrooms', 'bathrooms', 'floor_area', 'view_count', 'floor_level'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        return $query->paginate($perPage);
    }

    /**
     * Apply filters to query
     */
    protected function applyFilters(Builder $query, array $filters): void
    {
        // Search
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('unit_number', 'like', "%{$search}%")
                    ->orWhereHas('project', function ($projectQuery) use ($search) {
                        $projectQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('city', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%");
                    });
            });
        }

        // Property type
        if (isset($filters['property_type'])) {
            $query->byType($filters['property_type']);
        }

        // Listing status
        if (isset($filters['listing_status'])) {
            $query->where('listing_status', $filters['listing_status']);
        } else {
            // Default to available
            if (!isset($filters['show_all'])) {
                $query->available();
            }
        }

        // Price range
        if (isset($filters['min_price']) || isset($filters['max_price'])) {
            $query->byPriceRange($filters['min_price'] ?? null, $filters['max_price'] ?? null);
        }

        // Project filter
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        // Developer filter
        if (isset($filters['developer_id'])) {
            $query->whereHas('project', function ($projectQuery) use ($filters) {
                $projectQuery->where('developer_id', $filters['developer_id']);
            });
        }

        // Floor area range
        if (isset($filters['min_floor_area']) || isset($filters['max_floor_area'])) {
            $query->byFloorArea($filters['min_floor_area'] ?? null, $filters['max_floor_area'] ?? null);
        }

        // Floor level range
        if (isset($filters['min_floor']) || isset($filters['max_floor'])) {
            $query->byFloor($filters['min_floor'] ?? null, $filters['max_floor'] ?? null);
        }

        // Bedrooms
        if (isset($filters['bedrooms'])) {
            $query->byBedrooms($filters['bedrooms']);
        }

        // Bathrooms
        if (isset($filters['bathrooms'])) {
            $query->byBathrooms($filters['bathrooms']);
        }

        // Featured
        if (isset($filters['featured']) && $filters['featured']) {
            $query->featured();
        }

        // Orientation
        if (isset($filters['orientation'])) {
            $query->where('orientation', $filters['orientation']);
        }

        // View type
        if (isset($filters['view_type'])) {
            $query->where('view_type', $filters['view_type']);
        }

        // City
        if (isset($filters['city'])) {
            $query->whereHas('project', function ($projectQuery) use ($filters) {
                $projectQuery->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }
    }

    /**
     * Get property statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_properties' => Property::count(),
            'available_properties' => Property::available()->count(),
            'reserved_properties' => Property::reserved()->count(),
            'sold_properties' => Property::sold()->count(),
            'featured_properties' => Property::featured()->count(),
            'total_views' => Property::sum('view_count'),
            // Use database aggregation instead of loading all properties into memory
            'average_price' => DB::table('property_pricing')
                    ->join('properties', 'property_pricing.property_id', '=', 'properties.id')
                    ->whereNull('properties.deleted_at')
                    ->avg('property_pricing.total_contract_price') ?? 0,
            'properties_by_type' => Property::select('property_type', DB::raw('count(*) as count'))
                ->groupBy('property_type')
                ->pluck('count', 'property_type'),
        ];
    }

    /**
     * Bulk update property status
     */
    public function bulkUpdateStatus(array $propertyIds, string $status): int
    {
        return Property::whereIn('id', $propertyIds)->update(['listing_status' => $status]);
    }

    /**
     * Bulk delete properties (soft delete)
     */
    public function bulkDelete(array $propertyIds): int
    {
        return Property::whereIn('id', $propertyIds)->delete();
    }
}
