<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\RealEstateProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PropertyListingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Property::with(['project.developer', 'pricing', 'images'])
            ->where('listing_status', 'available')
            ->whereNull('deleted_at');

        // Apply filters
        if ($request->filled('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        if ($request->filled('city')) {
            $query->whereHas('project', function ($q) use ($request) {
                $q->where('city', 'like', '%' . $request->city . '%');
            });
        }

        if ($request->filled('min_price')) {
            $query->whereHas('pricing', function ($q) use ($request) {
                $q->where('total_contract_price', '>=', $request->min_price);
            });
        }

        if ($request->filled('max_price')) {
            $query->whereHas('pricing', function ($q) use ($request) {
                $q->where('total_contract_price', '<=', $request->max_price);
            });
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', '>=', $request->bedrooms);
        }

        if ($request->filled('bathrooms')) {
            $query->where('bathrooms', '>=', $request->bathrooms);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('project', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $properties = $query->latest()->paginate(12);

        // Cache filter options for 30 minutes
        $filters = Cache::remember('properties.filters', 1800, function () {
            return [
                'property_types' => Property::select('property_type')->distinct()->pluck('property_type'),
                'cities' => RealEstateProject::select('city')->distinct()->orderBy('city')->pluck('city'),
            ];
        });

        return Inertia::render('properties/index', [
            'properties' => $properties,
            'filters' => $filters,
            'appliedFilters' => $request->only(['property_type', 'city', 'min_price', 'max_price', 'bedrooms', 'bathrooms', 'search']),
        ]);
    }

    public function show(Property $property): Response
    {
        $property->load([
            'project.developer',
            'pricing.financingOptions',
            'images',
            'contacts',
        ]);

        // Increment view count
        $property->increment('views_count');

        // Get similar properties
        $similarProperties = Property::with(['project', 'pricing', 'images'])
            ->where('id', '!=', $property->id)
            ->where('property_type', $property->property_type)
            ->where('listing_status', 'available')
            ->whereHas('project', function ($q) use ($property) {
                $q->where('city', $property->project->city);
            })
            ->limit(4)
            ->get();

        return Inertia::render('properties/show', [
            'property' => $property,
            'similarProperties' => $similarProperties,
        ]);
    }
}
