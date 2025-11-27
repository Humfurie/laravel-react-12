<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use App\Models\FinancingOption;
use App\Models\Image;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyPricing;
use App\Models\RealEstateProject;
use App\Services\ImageService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Concurrency;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RealEstateController extends Controller
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        // Check if user can view any of the resources
        if (!auth()->user()->can('viewAny', Developer::class) &&
            !auth()->user()->can('viewAny', RealEstateProject::class) &&
            !auth()->user()->can('viewAny', Property::class)) {
            abort(403, 'You do not have permission to access this page.');
        }

        // Fetch all data in parallel
        [$developers, $projects, $properties, $inquiries] = Concurrency::run([
            fn() => Developer::with(['realEstateProjects.properties'])->get(),
            fn() => RealEstateProject::with(['developer', 'properties'])->get(),
            fn() => Property::with(['project.developer', 'pricing', 'contacts'])->get(),
            fn() => Inquiry::with(['property.project'])->latest()->get(),
        ]);

        return Inertia::render('admin/real-estate', [
            'developers' => $developers,
            'projects' => $projects,
            'properties' => $properties,
            'inquiries' => $inquiries,
            'can' => [
                'createDeveloper' => auth()->user()->can('create', Developer::class),
                'createProject' => auth()->user()->can('create', RealEstateProject::class),
                'createProperty' => auth()->user()->can('create', Property::class),
            ],
        ]);
    }

    // Developer CRUD
    public function createDeveloper()
    {
        $this->authorize('create', Developer::class);

        return Inertia::render('admin/real-estate/developers/create');
    }

    public function editDeveloper(Developer $developer)
    {
        $this->authorize('update', $developer);

        return Inertia::render('admin/real-estate/developers/edit', [
            'developer' => $developer,
        ]);
    }

    public function storeDeveloper(Request $request)
    {
        $this->authorize('create', Developer::class);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'logo_file' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:50',
            'website' => 'nullable|url',
        ]);

        $logoFile = $request->file('logo_file');

        unset($validated['logo_file']);

        $developer = Developer::create($validated);

        if ($logoFile) {
            $image = $this->imageService->upload($logoFile, $developer, 'developer-logos', true, 0);
            $developer->forceFill(['logo_url' => $image->url])->save();
        }

        return redirect()->route('real-estate.developers.edit', $developer->id)->with('success', 'Developer created successfully');
    }

    public function updateDeveloper(Request $request, Developer $developer)
    {
        $this->authorize('update', $developer);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'logo_file' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:50',
            'website' => 'nullable|url',
        ]);

        $logoFile = $request->file('logo_file');

        unset($validated['logo_file']);

        $developer->update($validated);

        if ($logoFile) {
            $developer->images()->each(function (Image $image) {
                $this->imageService->delete($image);
            });

            $image = $this->imageService->upload($logoFile, $developer, 'developer-logos', true, 0);
            $developer->forceFill(['logo_url' => $image->url])->save();
        }

        return redirect()->route('real-estate.developers.edit', $developer->id)->with('success', 'Developer updated successfully');
    }

    public function destroyDeveloper(Developer $developer)
    {
        $this->authorize('delete', $developer);

        $developer->delete();

        return redirect()->route('real-estate.index')->with('success', 'Developer deleted successfully');
    }

    // Project CRUD
    public function createProject()
    {
        $this->authorize('create', RealEstateProject::class);

        $developers = Developer::all();

        return Inertia::render('admin/real-estate/projects/create', [
            'developers' => $developers,
        ]);
    }

    public function editProject($project)
    {
        $this->authorize('update', RealEstateProject::class);
        $project = RealEstateProject::with(['developer', 'images' => function ($query) {
            $query->ordered(); // Load images in order
        }])->findOrFail($project);

        $developers = Developer::all();

        // Transform project data for frontend
        $projectData = $project->toArray();
        $projectData['images'] = $project->images->pluck('url')->values()->all();
        $projectData['featured_image'] = $project->images->firstWhere('is_primary', true)?->url ?? '';

        return Inertia::render('admin/real-estate/projects/edit', [
            'project' => $projectData,
            'developers' => $developers,
        ]);
    }

    public function storeProject(Request $request)
    {
        $this->authorize('create', RealEstateProject::class);

        try {
            Log::info('Store project request:', $request->except(['featured_image', 'additional_images']));

            $validated = $request->validate([
                'developer_id' => 'required|exists:developers,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'project_type' => 'required|string',
                'address' => 'nullable|string',
                'city' => 'required|string|max:100',
                'province' => 'required|string|max:100',
                'region' => 'required|string|max:100',
                'country' => 'string|max:50',
                'postal_code' => 'nullable|string|max:20',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'turnover_date' => 'nullable|string',
                'completion_year' => 'nullable|integer',
                'status' => 'required|string',
                'total_units' => 'nullable|integer',
                'total_floors' => 'nullable|integer',
                'amenities' => 'nullable|array',
                'featured_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
                'additional_images' => 'nullable|array',
                'additional_images.*' => 'file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
                'virtual_tour_url' => 'nullable|url',
                'featured' => 'boolean',
            ]);

            $validated['slug'] = Str::slug($validated['name']);
            $validated['country'] = $validated['country'] ?? 'Philippines';

            // Extract image files before creating project
            $featuredImageFile = $request->file('featured_image');
            $additionalImageFiles = $request->file('additional_images', []);

            // Remove images from validated data (we'll use relationships instead)
            unset($validated['featured_image'], $validated['additional_images']);

            // Create the project
            $project = RealEstateProject::create($validated);
            Log::info('Project created:', ['id' => $project->id]);

            // Upload and attach featured image if provided
            if ($featuredImageFile) {
                $image = $this->imageService->upload($featuredImageFile, $project, 'project-images', true, 0);
                Log::info('Featured image attached', ['image_id' => $image->id]);
            }

            // Upload and attach additional images
            foreach ($additionalImageFiles as $index => $file) {
                $image = $this->imageService->upload($file, $project, 'project-images', false, $index + 1);
                Log::info('Additional image attached', ['image_id' => $image->id, 'index' => $index + 1]);
            }

            Log::info('Project images:', ['count' => $project->images()->count()]);

            return redirect()->route('real-estate.projects.edit', $project->id)->with('success', 'Project created successfully');
        } catch (Exception $e) {
            Log::error('Error creating project:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return redirect()->back()->withErrors(['error' => 'Failed to create project: ' . $e->getMessage()])->withInput();
        }
    }

    public function updateProject(Request $request, $project)
    {
        $this->authorize('update', RealEstateProject::class);

        try {
            $project = RealEstateProject::findOrFail($project);
            Log::info('Update project request:', $request->except(['featured_image', 'additional_images']));

            $validated = $request->validate([
                'developer_id' => 'required|exists:developers,id',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'project_type' => 'required|string',
                'address' => 'nullable|string',
                'city' => 'required|string|max:100',
                'province' => 'required|string|max:100',
                'region' => 'required|string|max:100',
                'country' => 'string|max:50',
                'postal_code' => 'nullable|string|max:20',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'turnover_date' => 'nullable|string',
                'completion_year' => 'nullable|integer',
                'status' => 'required|string',
                'total_units' => 'nullable|integer',
                'total_floors' => 'nullable|integer',
                'amenities' => 'nullable|array',
                'existing_images' => 'nullable|array',
                'existing_images.*' => 'string',
                'featured_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
                'additional_images' => 'nullable|array',
                'additional_images.*' => 'file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
                'virtual_tour_url' => 'nullable|url',
                'featured' => 'boolean',
            ]);

            $validated['slug'] = Str::slug($validated['name']);
            $validated['country'] = $validated['country'] ?? 'Philippines';

            // Extract image data
            $existingImageUrls = $request->input('existing_images', []);
            $featuredImageFile = $request->file('featured_image');
            $additionalImageFiles = $request->file('additional_images', []);

            // Remove images from validated data
            unset($validated['existing_images'], $validated['featured_image'], $validated['additional_images']);

            // Update the project
            $project->update($validated);
            Log::info('Project updated:', ['id' => $project->id]);

            // Delete images that are no longer in existing_images
            $imagesToKeep = $project->images()->whereIn('path', array_map(function ($url) {
                return str_replace('/storage/', '', parse_url($url, PHP_URL_PATH));
            }, $existingImageUrls))->pluck('id')->toArray();

            $project->images()->whereNotIn('id', $imagesToKeep)->each(function ($image) {
                $this->imageService->delete($image);
            });

            // Get the current max order for images
            $currentMaxOrder = $project->images()->max('order') ?? -1;

            // Upload new featured image if provided
            if ($featuredImageFile) {
                $image = $this->imageService->upload($featuredImageFile, $project, 'project-images', true, 0);
                Log::info('New featured image uploaded', ['image_id' => $image->id]);
            }

            // Upload new additional images
            foreach ($additionalImageFiles as $index => $file) {
                $order = $currentMaxOrder + $index + 1;
                $image = $this->imageService->upload($file, $project, 'project-images', false, $order);
                Log::info('New additional image uploaded', ['image_id' => $image->id, 'order' => $order]);
            }

            Log::info('Project images after update:', ['count' => $project->fresh()->images()->count()]);

            // Redirect back to edit page with updated data
            return redirect()->route('real-estate.projects.edit', $project->id)->with('success', 'Project updated successfully');
        } catch (Exception $e) {
            Log::error('Error updating project:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return redirect()->back()->withErrors(['error' => 'Failed to update project: ' . $e->getMessage()])->withInput();
        }
    }

    public function destroyProject($project)
    {
        $this->authorize('delete', RealEstateProject::class);

        $project = RealEstateProject::findOrFail($project);
        $project->delete();

        return redirect()->route('real-estate.index')->with('success', 'Project deleted successfully');
    }

    // Property CRUD
    public function indexProperty()
    {
        $this->authorize('viewAny', Property::class);

        $properties = Property::with(['project.developer', 'pricing', 'contacts', 'images'])
            ->latest()
            ->paginate(15);

        return Inertia::render('admin/real-estate/property/index', [
            'properties' => $properties,
            'can' => [
                'create' => auth()->user()->can('create', Property::class),
            ],
        ]);
    }

    public function createProperty()
    {
        $this->authorize('create', Property::class);

        $projects = RealEstateProject::with('developer')->get();

        return Inertia::render('admin/real-estate/property/form', [
            'projects' => $projects,
            'property' => null,
        ]);
    }

    public function editProperty(Property $property)
    {
        $this->authorize('update', $property);
        $property->load(['project.developer', 'pricing', 'contacts', 'images']);
        $projects = RealEstateProject::with('developer')->get();

        return Inertia::render('admin/real-estate/property/form', [
            'property' => $property,
            'projects' => $projects,
        ]);
    }

    public function storeProperty(Request $request)
    {
        $this->authorize('create', Property::class);

        $validated = $request->validate([
            'project_id' => 'nullable|exists:real_estate_projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_number' => 'nullable|string|max:50',
            'floor_level' => 'nullable|integer',
            'building_phase' => 'nullable|string|max:50',
            'property_type' => 'required|string|max:50',
            'floor_area' => 'nullable|numeric',
            'floor_area_unit' => 'nullable|string|max:10',
            'balcony_area' => 'nullable|numeric',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|numeric',
            'parking_spaces' => 'nullable|integer',
            'orientation' => 'nullable|string|max:50',
            'view_type' => 'nullable|string|max:100',
            'listing_status' => 'required|string|max:50',
            'features' => 'nullable|array',
            'images' => 'nullable|array',
            'floor_plan_url' => 'nullable|url',
            'featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        // Extract images before creating property
        $imageUrls = $validated['images'] ?? [];
        unset($validated['images']);

        $property = Property::create($validated);

        // Attach images to property
        foreach ($imageUrls as $index => $imageUrl) {
            $this->attachImageToModel($property, $imageUrl, $index === 0, $index);
        }

        return redirect()->route('real-estate.index')->with('success', 'Property created successfully');
    }

    public function updateProperty(Request $request, Property $property)
    {
        $this->authorize('update', $property);

        $validated = $request->validate([
            'project_id' => 'nullable|exists:real_estate_projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_number' => 'nullable|string|max:50',
            'floor_level' => 'nullable|integer',
            'building_phase' => 'nullable|string|max:50',
            'property_type' => 'required|string|max:50',
            'floor_area' => 'nullable|numeric',
            'floor_area_unit' => 'nullable|string|max:10',
            'balcony_area' => 'nullable|numeric',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|numeric',
            'parking_spaces' => 'nullable|integer',
            'orientation' => 'nullable|string|max:50',
            'view_type' => 'nullable|string|max:100',
            'listing_status' => 'required|string|max:50',
            'features' => 'nullable|array',
            'images' => 'nullable|array',
            'floor_plan_url' => 'nullable|url',
            'featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']);

        // Remove images from validated data (handled via relationships)
        unset($validated['images']);

        $property->update($validated);

        return redirect()->route('real-estate.index')->with('success', 'Property updated successfully');
    }

    public function destroyProperty(Property $property)
    {
        $this->authorize('delete', $property);

        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully',
        ]);
    }

    // Property Pricing CRUD
    public function storePricing(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'reservation_fee' => 'nullable|numeric',
            'total_contract_price' => 'required|numeric',
            'net_selling_price' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'downpayment_percentage' => 'nullable|numeric',
            'downpayment_amount' => 'nullable|numeric',
            'equity_terms_months' => 'nullable|integer',
            'monthly_equity' => 'nullable|numeric',
            'balloon_payment' => 'nullable|numeric',
            'balloon_payment_month' => 'nullable|integer',
            'bank_financing_amount' => 'nullable|numeric',
            'bank_financing_percentage' => 'nullable|numeric',
            'miscellaneous_fees_included' => 'boolean',
            'transfer_fee_percentage' => 'nullable|numeric',
            'move_in_fee_percentage' => 'nullable|numeric',
            'association_dues_monthly' => 'nullable|numeric',
            'parking_slot_price' => 'nullable|numeric',
            'payment_scheme_name' => 'nullable|string|max:100',
            'payment_notes' => 'nullable|string',
        ]);

        $pricing = PropertyPricing::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pricing created successfully',
            'pricing' => $pricing,
        ]);
    }

    public function updatePricing(Request $request, PropertyPricing $pricing)
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'reservation_fee' => 'nullable|numeric',
            'total_contract_price' => 'required|numeric',
            'net_selling_price' => 'nullable|numeric',
            'currency' => 'nullable|string|max:10',
            'downpayment_percentage' => 'nullable|numeric',
            'downpayment_amount' => 'nullable|numeric',
            'equity_terms_months' => 'nullable|integer',
            'monthly_equity' => 'nullable|numeric',
            'balloon_payment' => 'nullable|numeric',
            'balloon_payment_month' => 'nullable|integer',
            'bank_financing_amount' => 'nullable|numeric',
            'bank_financing_percentage' => 'nullable|numeric',
            'miscellaneous_fees_included' => 'boolean',
            'transfer_fee_percentage' => 'nullable|numeric',
            'move_in_fee_percentage' => 'nullable|numeric',
            'association_dues_monthly' => 'nullable|numeric',
            'parking_slot_price' => 'nullable|numeric',
            'payment_scheme_name' => 'nullable|string|max:100',
            'payment_notes' => 'nullable|string',
        ]);

        $pricing->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pricing updated successfully',
            'pricing' => $pricing,
        ]);
    }

    public function destroyPricing(PropertyPricing $pricing)
    {
        $pricing->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pricing deleted successfully',
        ]);
    }

    // Financing Options management
    public function storeFinancingOption(Request $request)
    {
        $validated = $request->validate([
            'property_pricing_id' => 'required|exists:property_pricing,id',
            'bank_name' => 'required|string|max:100',
            'loan_to_value_ratio' => 'nullable|numeric',
            'interest_rate' => 'nullable|numeric',
            'loan_term_years' => 'required|integer',
            'monthly_amortization' => 'nullable|numeric',
            'processing_fee' => 'nullable|numeric',
            'requirements' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $financingOption = FinancingOption::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Financing option created successfully',
            'financing_option' => $financingOption,
        ]);
    }

    public function updateFinancingOption(Request $request, FinancingOption $financingOption)
    {
        $validated = $request->validate([
            'property_pricing_id' => 'required|exists:property_pricing,id',
            'bank_name' => 'required|string|max:100',
            'loan_to_value_ratio' => 'nullable|numeric',
            'interest_rate' => 'nullable|numeric',
            'loan_term_years' => 'required|integer',
            'monthly_amortization' => 'nullable|numeric',
            'processing_fee' => 'nullable|numeric',
            'requirements' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $financingOption->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Financing option updated successfully',
            'financing_option' => $financingOption,
        ]);
    }

    public function destroyFinancingOption(FinancingOption $financingOption)
    {
        $financingOption->delete();

        return response()->json([
            'success' => true,
            'message' => 'Financing option deleted successfully',
        ]);
    }

    // Inquiry management
    public function updateInquiryStatus(Request $request, Inquiry $inquiry)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,viewing_scheduled,closed',
        ]);

        $inquiry->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inquiry status updated successfully',
            'inquiry' => $inquiry->load('property.project'),
        ]);
    }

    public function destroyInquiry(Inquiry $inquiry)
    {
        $inquiry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry deleted successfully',
        ]);
    }

    // Image upload using ImageService with polymorphic relationships
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
                'type' => 'required|in:logo,property,project',
                'model_type' => 'nullable|string',
                'model_id' => 'nullable|integer',
                'is_primary' => 'nullable|boolean',
            ]);

            $file = $request->file('image');
            $type = $request->input('type');
            $modelType = $request->input('model_type');
            $modelId = $request->input('model_id');
            $isPrimary = $request->boolean('is_primary', false);

            // Determine storage directory based on type
            $directory = match ($type) {
                'property' => 'property-images',
                'project' => 'project-images',
                'logo' => 'developer-logos',
                default => 'real-estate'
            };

            // If model_type and model_id provided, attach to the model
            if ($modelType && $modelId) {
                $model = match ($modelType) {
                    'property' => Property::findOrFail($modelId),
                    'project' => RealEstateProject::findOrFail($modelId),
                    default => null
                };

                if ($model) {
                    $image = $this->imageService->upload($file, $model, $directory, $isPrimary);

                    return response()->json([
                        'success' => true,
                        'message' => 'Image uploaded successfully',
                        'image' => $image->load('imageable'),
                        'url' => $image->url,
                    ]);
                }
            }

            // Otherwise, upload temporarily (for forms before model is created)
            // Store to temp directory - will be properly processed with ImageService later
            $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs($directory . '/temp', $filename, 'minio');
            $url = Storage::disk('minio')->url($path);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded temporarily',
                'url' => $url,
                'path' => $path,
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'temp' => true,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading image: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Attach temporary images to a model
    public function attachImages(Request $request)
    {
        try {
            $request->validate([
                'model_type' => 'required|in:property,project',
                'model_id' => 'required|integer',
                'images' => 'required|array',
                'images.*.url' => 'required|string',
                'images.*.is_primary' => 'nullable|boolean',
            ]);

            $modelType = $request->input('model_type');
            $modelId = $request->input('model_id');
            $images = $request->input('images');

            $model = match ($modelType) {
                'property' => Property::findOrFail($modelId),
                'project' => RealEstateProject::findOrFail($modelId),
            };

            $attachedImages = [];

            foreach ($images as $index => $imageData) {
                $url = $imageData['url'];
                $isPrimary = $imageData['is_primary'] ?? ($index === 0);

                // Extract path from URL
                $path = str_replace('/storage/', '', parse_url($url, PHP_URL_PATH));

                if (Storage::disk('public')->exists($path)) {
                    $fullPath = storage_path('app/public/' . $path);
                    $fileInfo = pathinfo($path);

                    $image = $model->images()->create([
                        'name' => $fileInfo['basename'],
                        'path' => $path,
                        'filename' => $fileInfo['basename'],
                        'mime_type' => mime_content_type($fullPath),
                        'size' => filesize($fullPath),
                        'order' => $index,
                        'is_primary' => $isPrimary,
                        'sizes' => [],
                    ]);

                    $attachedImages[] = $image;
                }
            }

            return response()->json([
                'success' => true,
                'message' => count($attachedImages) . ' images attached successfully',
                'images' => $attachedImages,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error attaching images: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Reorder images
    public function reorderImages(Request $request)
    {
        try {
            $request->validate([
                'model_type' => 'required|in:property,project',
                'model_id' => 'required|integer',
                'images' => 'required|array',
                'images.*.id' => 'required|integer',
                'images.*.order' => 'required|integer',
            ]);

            $model = match ($request->input('model_type')) {
                'property' => Property::findOrFail($request->input('model_id')),
                'project' => RealEstateProject::findOrFail($request->input('model_id')),
            };

            $this->imageService->reorder($model, $request->input('images'));

            return response()->json([
                'success' => true,
                'message' => 'Images reordered successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error reordering images: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Delete an image
    public function deleteImage(Image $image)
    {
        try {
            $this->imageService->delete($image);

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting image: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Set image as primary
    public function setPrimaryImage(Image $image)
    {
        try {
            $this->imageService->setPrimary($image);

            return response()->json([
                'success' => true,
                'message' => 'Primary image set successfully',
                'image' => $image->fresh(),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error setting primary image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper method to attach an image URL to a model
     * Converts temporary uploaded images into proper Image records with thumbnails
     */
    private function attachImageToModel($model, string $imageUrl, bool $isPrimary = false, int $order = 0): ?Image
    {
        try {
            Log::info('Attaching image', ['url' => $imageUrl, 'is_primary' => $isPrimary, 'order' => $order]);

            // Extract path from URL
            $tempPath = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
            Log::info('Extracted temp path:', ['path' => $tempPath]);

            // Check if file exists
            if (!Storage::disk('public')->exists($tempPath)) {
                Log::warning('File not found', ['path' => $tempPath]);

                return null;
            }

            $fullTempPath = storage_path('app/public/' . $tempPath);
            $fileInfo = pathinfo($tempPath);

            // Determine final directory based on model type
            $directory = match (get_class($model)) {
                Property::class => 'property-images',
                RealEstateProject::class => 'project-images',
                default => 'real-estate'
            };

            // Generate new filename for final location
            $finalFilename = time() . '_' . Str::random(10) . '.' . $fileInfo['extension'];
            $finalPath = $directory . '/' . $finalFilename;

            // Move file from temp to final location
            Storage::disk('public')->move($tempPath, $finalPath);
            Log::info('Moved file', ['from' => $tempPath, 'to' => $finalPath]);

            // Generate thumbnails using ImageService
            $thumbnailPaths = $this->generateThumbnailsFromPath($finalPath, $directory, $finalFilename);

            // Get the next order number if not provided
            if ($order === 0) {
                $order = $model->images()->max('order') + 1 ?? 0;
            }

            // If this should be primary, unset other primary images
            if ($isPrimary) {
                $model->images()->update(['is_primary' => false]);
            }

            // Create image record with thumbnails
            $image = $model->images()->create([
                'name' => $fileInfo['basename'],
                'path' => $finalPath,
                'filename' => $finalFilename,
                'mime_type' => Storage::disk('public')->mimeType($finalPath),
                'size' => Storage::disk('public')->size($finalPath),
                'order' => $order,
                'is_primary' => $isPrimary,
                'sizes' => $thumbnailPaths,
            ]);

            Log::info('Image record created with thumbnails', ['id' => $image->id, 'thumbnails' => count($thumbnailPaths)]);

            return $image;
        } catch (Exception $e) {
            Log::error('Error attaching image', ['url' => $imageUrl, 'error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return null;
        }
    }

    /**
     * Generate thumbnails for an already stored image
     */
    private function generateThumbnailsFromPath(string $imagePath, string $directory, string $filename): array
    {
        try {
            $thumbnailPaths = [];
            $fullPath = storage_path('app/public/' . $imagePath);

            if (!file_exists($fullPath)) {
                Log::warning('Image file not found for thumbnail generation', ['path' => $fullPath]);

                return [];
            }

            // Load the image using ImageService's manager
            $imageManager = $this->imageService->getImageManager();
            $image = $imageManager->read($fullPath);

            foreach (ImageService::SIZES as $sizeName => $maxWidth) {
                // Create thumbnail directory
                $thumbnailDir = $directory . '/thumbs/' . $sizeName;
                $thumbnailFilename = pathinfo($filename, PATHINFO_FILENAME) . '_' . $sizeName . '.' . pathinfo($filename, PATHINFO_EXTENSION);

                // Resize image maintaining aspect ratio
                $thumbnail = clone $image;
                $thumbnail->scale(width: $maxWidth);

                // Generate the path
                $thumbnailPath = $thumbnailDir . '/' . $thumbnailFilename;
                $fullThumbnailPath = storage_path('app/public/' . $thumbnailPath);

                // Ensure directory exists
                if (!file_exists(dirname($fullThumbnailPath))) {
                    mkdir(dirname($fullThumbnailPath), 0755, true);
                }

                // Save the thumbnail
                $thumbnail->save($fullThumbnailPath);

                $thumbnailPaths[$sizeName] = $thumbnailPath;
            }

            Log::info('Generated thumbnails', ['count' => count($thumbnailPaths), 'sizes' => array_keys($thumbnailPaths)]);

            return $thumbnailPaths;
        } catch (Exception $e) {
            Log::error('Error generating thumbnails', ['error' => $e->getMessage()]);

            return [];
        }
    }
}
