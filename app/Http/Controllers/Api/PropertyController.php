<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\RealEstateProject;
use App\Models\PropertyPricing;
use App\Models\Contact;
use App\Models\Inquiry;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Property::query()->with(['project.developer', 'pricing', 'contacts', 'images']);

        // Search filters
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('unit_number', 'like', "%{$search}%")
                  ->orWhereHas('project', function($projectQuery) use ($search) {
                      $projectQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('city', 'like', "%{$search}%")
                                   ->orWhere('address', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by property type
        if ($request->has('property_type')) {
            $query->byType($request->get('property_type'));
        }

        // Filter by listing status
        if ($request->has('listing_status')) {
            $query->where('listing_status', $request->get('listing_status'));
        } else {
            // Default to available properties only
            $query->available();
        }

        // Price range filter (using pricing relationship)
        if ($request->has('min_price') || $request->has('max_price')) {
            $query->byPriceRange($request->get('min_price'), $request->get('max_price'));
        }

        // Project filter
        if ($request->has('project_id')) {
            $query->where('project_id', $request->get('project_id'));
        }

        // Developer filter (through project relationship)
        if ($request->has('developer_id')) {
            $query->whereHas('project', function($projectQuery) use ($request) {
                $projectQuery->where('developer_id', $request->get('developer_id'));
            });
        }

        // Floor area filter
        if ($request->has('min_floor_area') || $request->has('max_floor_area')) {
            $query->byFloorArea($request->get('min_floor_area'), $request->get('max_floor_area'));
        }

        // Floor level filter
        if ($request->has('min_floor') || $request->has('max_floor')) {
            $query->byFloor($request->get('min_floor'), $request->get('max_floor'));
        }

        // Bedrooms filter
        if ($request->has('bedrooms')) {
            $query->byBedrooms($request->get('bedrooms'));
        }

        // Bathrooms filter
        if ($request->has('bathrooms')) {
            $query->byBathrooms($request->get('bathrooms'));
        }

        // Featured properties
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Orientation filter
        if ($request->has('orientation')) {
            $query->where('orientation', $request->get('orientation'));
        }

        // View type filter
        if ($request->has('view_type')) {
            $query->where('view_type', $request->get('view_type'));
        }

        // City filter (through project relationship)
        if ($request->has('city')) {
            $query->whereHas('project', function($projectQuery) use ($request) {
                $projectQuery->where('city', 'like', '%' . $request->get('city') . '%');
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        $allowedSorts = ['created_at', 'title', 'bedrooms', 'bathrooms', 'floor_area', 'view_count', 'floor_level'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        $perPage = min($request->get('per_page', 15), 50); // Max 50 per page
        $properties = $query->paginate($perPage);

        return response()->json($properties);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:real_estate_projects,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:properties,slug',
            'description' => 'nullable|string',
            'unit_number' => 'nullable|string|max:20',
            'floor_level' => 'nullable|integer|min:1',
            'building_phase' => 'nullable|string|max:50',
            'property_type' => ['required', 'string', Rule::in([
                Property::PROPERTY_TYPE_STUDIO,
                Property::PROPERTY_TYPE_1BR,
                Property::PROPERTY_TYPE_2BR,
                Property::PROPERTY_TYPE_3BR,
                Property::PROPERTY_TYPE_PENTHOUSE,
            ])],
            'floor_area' => 'nullable|numeric|min:0',
            'floor_area_unit' => 'nullable|string|max:10',
            'balcony_area' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'parking_spaces' => 'nullable|integer|min:0',
            'orientation' => ['nullable', 'string', Rule::in([
                Property::ORIENTATION_NORTH,
                Property::ORIENTATION_SOUTH,
                Property::ORIENTATION_EAST,
                Property::ORIENTATION_WEST,
            ])],
            'view_type' => 'nullable|string|max:100',
            'listing_status' => ['nullable', 'string', Rule::in([
                Property::LISTING_STATUS_AVAILABLE,
                Property::LISTING_STATUS_RESERVED,
                Property::LISTING_STATUS_SOLD,
                Property::LISTING_STATUS_NOT_AVAILABLE,
            ])],
            'features' => 'nullable|array',
            'images' => 'nullable|array',
            'floor_plan_url' => 'nullable|url',
            'featured' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            $property = Property::create($validated);

            // Handle pricing if provided
            if ($request->has('pricing')) {
                $pricingData = $request->validate([
                    'pricing.reservation_fee' => 'nullable|numeric|min:0',
                    'pricing.total_contract_price' => 'required|numeric|min:0',
                    'pricing.net_selling_price' => 'nullable|numeric|min:0',
                    'pricing.currency' => 'nullable|string|size:3',
                    'pricing.downpayment_percentage' => 'nullable|numeric|between:0,100',
                    'pricing.downpayment_amount' => 'nullable|numeric|min:0',
                    'pricing.equity_terms_months' => 'nullable|integer|min:1',
                    'pricing.monthly_equity' => 'nullable|numeric|min:0',
                    'pricing.balloon_payment' => 'nullable|numeric|min:0',
                    'pricing.balloon_payment_month' => 'nullable|integer|min:1',
                    'pricing.bank_financing_amount' => 'nullable|numeric|min:0',
                    'pricing.bank_financing_percentage' => 'nullable|numeric|between:0,100',
                    'pricing.miscellaneous_fees_included' => 'boolean',
                    'pricing.transfer_fee_percentage' => 'nullable|numeric|between:0,100',
                    'pricing.move_in_fee_percentage' => 'nullable|numeric|between:0,100',
                    'pricing.association_dues_monthly' => 'nullable|numeric|min:0',
                    'pricing.parking_slot_price' => 'nullable|numeric|min:0',
                    'pricing.payment_scheme_name' => 'nullable|string|max:100',
                    'pricing.payment_notes' => 'nullable|string',
                ]);

                $property->pricing()->create(array_merge(
                    $pricingData['pricing'],
                    ['currency' => $pricingData['pricing']['currency'] ?? 'PHP']
                ));
            }

            // Handle contacts if provided
            if ($request->has('contacts')) {
                $contactsData = $request->validate([
                    'contacts' => 'array',
                    'contacts.*.contact_type' => ['required', 'string', Rule::in([
                        Contact::TYPE_AGENT,
                        Contact::TYPE_BROKER,
                        Contact::TYPE_DEVELOPER_DIRECT,
                    ])],
                    'contacts.*.contact_name' => 'required|string|max:255',
                    'contacts.*.contact_email' => 'required|email',
                    'contacts.*.contact_phone' => 'required|string|max:20',
                    'contacts.*.agent_license' => 'nullable|string|max:50',
                    'contacts.*.company_name' => 'nullable|string|max:255',
                    'contacts.*.is_primary' => 'boolean',
                ]);

                foreach ($contactsData['contacts'] as $contactData) {
                    $property->contacts()->create($contactData);
                }
            }

            DB::commit();

            $property->load(['project.developer', 'pricing', 'contacts', 'images']);

            return response()->json($property, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create property: ' . $e->getMessage()], 500);
        }
    }

    public function show(Property $property): JsonResponse
    {
        $property->load(['project.developer', 'pricing.financingOptions', 'contacts', 'inquiries', 'images']);
        $property->incrementViewCount();
        return response()->json($property);
    }

    public function update(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'exists:real_estate_projects,id',
            'title' => 'string|max:255',
            'slug' => 'string|unique:properties,slug,' . $property->id,
            'description' => 'nullable|string',
            'unit_number' => 'nullable|string|max:20',
            'floor_level' => 'nullable|integer|min:1',
            'building_phase' => 'nullable|string|max:50',
            'property_type' => ['string', Rule::in([
                Property::PROPERTY_TYPE_STUDIO,
                Property::PROPERTY_TYPE_1BR,
                Property::PROPERTY_TYPE_2BR,
                Property::PROPERTY_TYPE_3BR,
                Property::PROPERTY_TYPE_PENTHOUSE,
            ])],
            'floor_area' => 'nullable|numeric|min:0',
            'floor_area_unit' => 'nullable|string|max:10',
            'balcony_area' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|numeric|min:0',
            'parking_spaces' => 'nullable|integer|min:0',
            'orientation' => ['nullable', 'string', Rule::in([
                Property::ORIENTATION_NORTH,
                Property::ORIENTATION_SOUTH,
                Property::ORIENTATION_EAST,
                Property::ORIENTATION_WEST,
            ])],
            'view_type' => 'nullable|string|max:100',
            'listing_status' => ['nullable', 'string', Rule::in([
                Property::LISTING_STATUS_AVAILABLE,
                Property::LISTING_STATUS_RESERVED,
                Property::LISTING_STATUS_SOLD,
                Property::LISTING_STATUS_NOT_AVAILABLE,
            ])],
            'features' => 'nullable|array',
            'images' => 'nullable|array',
            'floor_plan_url' => 'nullable|url',
            'featured' => 'boolean',
        ]);

        $property->update($validated);
        $property->load(['project.developer', 'pricing', 'contacts', 'images']);

        return response()->json($property);
    }

    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return response()->json(['message' => 'Property deleted successfully']);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|exists:properties,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'name' => 'nullable|string|max:255'
        ]);

        if ($request->hasFile('image')) {
            $property = Property::findOrFail($request->get('property_id'));
            $imageFile = $request->file('image');

            // Create unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $imageFile->getClientOriginalExtension();

            // Store in public/property-images directory
            $path = $imageFile->storeAs('property-images', $filename, 'public');

            // Create the image record in database
            $image = $property->images()->create([
                'name' => $request->get('name', $imageFile->getClientOriginalName()),
                'path' => $path
            ]);

            // Return the full URL
            $url = Storage::url($path);

            return response()->json([
                'success' => true,
                'image' => $image,
                'url' => $url,
                'path' => $path
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file provided'
        ], 400);
    }

    public function deleteImage(Request $request, Property $property, Image $image): JsonResponse
    {
        // Verify the image belongs to this property
        if ($image->imageable_id !== $property->id || $image->imageable_type !== Property::class) {
            return response()->json(['error' => 'Image not found for this property'], 404);
        }

        // Delete the physical file
        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        // Delete the database record
        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    public function getImages(Property $property): JsonResponse
    {
        $images = $property->images()->get()->map(function ($image) {
            return [
                'id' => $image->id,
                'name' => $image->name,
                'path' => $image->path,
                'url' => Storage::url($image->path),
                'created_at' => $image->created_at
            ];
        });

        return response()->json($images);
    }

    public function featured(Request $request): JsonResponse
    {
        $properties = Property::featured()
            ->available()
            ->with(['project.developer', 'pricing', 'contacts', 'images'])
            ->orderBy('created_at', 'desc')
            ->limit($request->get('limit', 6))
            ->get();

        return response()->json($properties);
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude,radius'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude,radius'],
            'radius' => 'nullable|numeric|min:0.1|max:1000'
        ]);

        // Validate coordinates if provided
        if (($request->has('latitude') || $request->has('longitude')) && (!is_numeric($request->get('latitude')) || !is_numeric($request->get('longitude')))) {
            return response()->json(['errors' => ['coordinates' => ['Invalid coordinates provided']]], 422);
        }

        $query = Property::available()->with(['project.developer', 'pricing', 'contacts', 'images']);

        // Location-based search with radius
        if ($request->has('latitude') && $request->has('longitude') && $request->has('radius')) {
            $latitude = $request->get('latitude');
            $longitude = $request->get('longitude');
            $radius = $request->get('radius');

            // Haversine formula for distance calculation in kilometers
            $query->whereRaw("
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?
            ", [$latitude, $longitude, $latitude, $radius]);
        }

        // Location-based search through project relationships (fallback)
        if ($request->has('city')) {
            $query->whereHas('project', function($projectQuery) use ($request) {
                $projectQuery->where('city', 'like', '%' . $request->get('city') . '%');
            });
        }

        $properties = $query->paginate($validated['per_page'] ?? 15);

        return response()->json($properties);
    }

    public function createInquiry(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string|max:20',
            'inquiry_type' => ['required', 'string', Rule::in([
                Inquiry::TYPE_SITE_VISIT,
                Inquiry::TYPE_PRICING_INFO,
                Inquiry::TYPE_AVAILABILITY,
                Inquiry::TYPE_FINANCING,
                Inquiry::TYPE_GENERAL,
            ])],
            'message' => 'required|string',
            'preferred_contact_time' => 'nullable|string|max:100',
        ]);

        $inquiry = $property->inquiries()->create(array_merge(
            $validated,
            ['status' => Inquiry::STATUS_NEW]
        ));

        return response()->json($inquiry, 201);
    }

    public function getInquiries(Property $property): JsonResponse
    {
        $inquiries = $property->inquiries()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($inquiries);
    }

    public function updateInquiryStatus(Request $request, Property $property, Inquiry $inquiry): JsonResponse
    {
        // Verify inquiry belongs to this property
        if ($inquiry->property_id !== $property->id) {
            return response()->json(['error' => 'Inquiry not found for this property'], 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in([
                Inquiry::STATUS_NEW,
                Inquiry::STATUS_IN_PROGRESS,
                Inquiry::STATUS_RESPONDED,
                Inquiry::STATUS_CLOSED,
            ])],
            'agent_notes' => 'nullable|string',
        ]);

        $inquiry->update($validated);

        if ($validated['status'] === Inquiry::STATUS_RESPONDED) {
            $inquiry->markAsResponded();
        }

        return response()->json($inquiry);
    }
}
