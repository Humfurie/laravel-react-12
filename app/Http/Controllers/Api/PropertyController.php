<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReorderImagesRequest;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;
use App\Http\Requests\UploadImageRequest;
use App\Http\Resources\ImageResource;
use App\Http\Resources\PropertyResource;
use App\Models\Image;
use App\Models\Inquiry;
use App\Mail\NewInquiryNotification;
use Illuminate\Support\Facades\Mail;
use App\Models\Property;
use App\Services\ImageService;
use App\Services\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class PropertyController extends Controller
{
    protected PropertyService $propertyService;

    protected ImageService $imageService;

    public function __construct(PropertyService $propertyService, ImageService $imageService)
    {
        $this->propertyService = $propertyService;
        $this->imageService = $imageService;
    }

    /**
     * Get paginated list of properties with filters
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Property::class);

        $perPage = min($request->get('per_page', 15), 50);
        $properties = $this->propertyService->getProperties($request->all(), $perPage);

        return response()->json([
            'data' => PropertyResource::collection($properties),
            'current_page' => $properties->currentPage(),
            'per_page' => $properties->perPage(),
            'total' => $properties->total(),
            'last_page' => $properties->lastPage(),
        ]);
    }

    /**
     * Create a new property
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        Gate::authorize('create', Property::class);

        $property = $this->propertyService->createProperty(
            $request->validated(),
            $request->input('pricing', []),
            $request->input('contacts', [])
        );

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully',
            'data' => new PropertyResource($property),
        ], 201);
    }

    public function show(Property $property): JsonResponse
    {
        Gate::authorize('view', $property);

        $property->load(['project.developer', 'pricing.financingOptions', 'contacts', 'inquiries', 'images']);
        $property->incrementViewCount();

        return response()->json([
            'success' => true,
            'data' => new PropertyResource($property),
        ]);
    }

    public function update(UpdatePropertyRequest $request, Property $property): JsonResponse
    {
        Gate::authorize('update', $property);

        $property = $this->propertyService->updateProperty(
            $property,
            $request->validated(),
            $request->input('pricing'),
            $request->input('contacts')
        );

        return response()->json([
            'success' => true,
            'message' => 'Property updated successfully',
            'data' => new PropertyResource($property),
        ]);
    }

    public function destroy(Property $property): JsonResponse
    {
        Gate::authorize('delete', $property);

        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully',
        ]);
    }

    public function uploadImage(UploadImageRequest $request, Property $property): JsonResponse
    {
        Gate::authorize('update', $property);

        // Handle single image upload
        if ($request->hasFile('image')) {
            $name = $request->input('name') ?? $request->file('image')->getClientOriginalName();
            $isPrimary = $property->images()->count() === 0 || $request->boolean('is_primary', false);

            $image = $this->imageService->upload(
                $request->file('image'),
                $property,
                'property-images',
                $isPrimary
            );

            // Update name if provided
            if ($request->has('name')) {
                $image->update(['name' => $name]);
            }

            return response()->json([
                'success' => true,
                'image' => [
                    'id' => $image->id,
                    'name' => $image->name,
                    'path' => $image->path,
                ],
                'url' => $image->url,
                'path' => $image->path,
            ]);
        }

        // Handle multiple images upload (backward compatibility)
        if ($request->hasFile('images')) {
            $images = $this->imageService->uploadMultiple(
                $request->file('images'),
                $property,
                'property-images'
            );

            return response()->json([
                'success' => true,
                'message' => count($images) > 1 ? 'Images uploaded successfully' : 'Image uploaded successfully',
                'data' => ImageResource::collection($images),
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file provided',
        ], 422);
    }

    public function deleteImage(Property $property, Image $image): JsonResponse
    {
        Gate::authorize('update', $property);

        // Verify the image belongs to this property
        if ($image->imageable_id !== $property->id || $image->imageable_type !== Property::class) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found for this property',
            ], 404);
        }

        $this->imageService->delete($image);

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }

    public function getImages(Property $property): JsonResponse
    {
        $images = $property->images()->ordered()->get();

        // Return empty array if no images
        if ($images->isEmpty()) {
            return response()->json([]);
        }

        return response()->json(ImageResource::collection($images));
    }

    public function reorderImages(ReorderImagesRequest $request, Property $property): JsonResponse
    {
        Gate::authorize('update', $property);

        $this->imageService->reorder(
            $property,
            $request->input('images')
        );

        // Fetch the reordered images
        $reorderedImages = $property->images()->ordered()->get();

        return response()->json([
            'success' => true,
            'message' => 'Images reordered successfully',
            'data' => ImageResource::collection($reorderedImages),
        ]);
    }

    public function setPrimaryImage(Property $property, Image $image): JsonResponse
    {
        Gate::authorize('update', $property);

        // Verify the image belongs to this property
        if ($image->imageable_id !== $property->id || $image->imageable_type !== Property::class) {
            return response()->json([
                'success' => false,
                'message' => 'Image not found for this property',
            ], 404);
        }

        $this->imageService->setPrimary($image);

        return response()->json([
            'success' => true,
            'message' => 'Primary image set successfully',
            'data' => new ImageResource($image->fresh()),
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $property = Property::withTrashed()->findOrFail($id);

        Gate::authorize('restore', $property);

        $property->restore();

        return response()->json([
            'success' => true,
            'message' => 'Property restored successfully',
            'data' => new PropertyResource($property->load(['project.developer', 'pricing', 'contacts', 'images'])),
        ]);
    }

    public function forceDelete(int $id): JsonResponse
    {
        $property = Property::withTrashed()->findOrFail($id);

        Gate::authorize('forceDelete', $property);

        // Delete all images associated with this property
        foreach ($property->images as $image) {
            $this->imageService->delete($image);
        }

        $property->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Property permanently deleted',
        ]);
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
            'radius' => 'nullable|numeric|min:0.1|max:1000',
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
            $query->whereRaw('
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?
            ', [$latitude, $longitude, $latitude, $radius]);
        }

        // Location-based search through project relationships (fallback)
        if ($request->has('city')) {
            $query->whereHas('project', function ($projectQuery) use ($request) {
                $projectQuery->where('city', 'like', '%' . $request->get('city') . '%');
            });
        }

        $properties = $query->paginate($validated['per_page'] ?? 15);

        return response()->json([
            'data' => PropertyResource::collection($properties),
            'current_page' => $properties->currentPage(),
            'per_page' => $properties->perPage(),
            'total' => $properties->total(),
            'last_page' => $properties->lastPage(),
        ]);
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

        // Send email notification to admin
        $adminEmail = config('mail.admin_email', config('mail.from.address'));
        if ($adminEmail) {
            Mail::to($adminEmail)->send(new NewInquiryNotification($inquiry->load('property')));
        }

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
