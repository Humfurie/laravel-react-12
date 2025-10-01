<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Developer;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\PropertyPricing;
use App\Models\RealEstateProject;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RealEstateController extends Controller
{
    public function index()
    {
        $developers = Developer::with(['realEstateProjects.properties'])->get();
        $projects = RealEstateProject::with(['developer', 'properties'])->get();
        $properties = Property::with(['project.developer', 'pricing', 'contacts'])->get();
        $inquiries = Inquiry::with(['property.project'])->latest()->get();

        return Inertia::render('admin/real-estate', [
            'developers' => $developers,
            'projects' => $projects,
            'properties' => $properties,
            'inquiries' => $inquiries,
        ]);
    }

    // Developer CRUD
    public function createDeveloper()
    {
        return Inertia::render('admin/real-estate/developers/create');
    }

    public function editDeveloper(Developer $developer)
    {
        return Inertia::render('admin/real-estate/developers/edit', [
            'developer' => $developer
        ]);
    }

    public function storeDeveloper(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:50',
            'website' => 'nullable|url',
        ]);

        Developer::create($validated);

        return redirect()->route('real-estate.index')->with('success', 'Developer created successfully');
    }

    public function updateDeveloper(Request $request, Developer $developer)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:50',
            'website' => 'nullable|url',
        ]);

        $developer->update($validated);

        return redirect()->route('real-estate.index')->with('success', 'Developer updated successfully');
    }

    public function destroyDeveloper(Developer $developer)
    {
        $developer->delete();

        return redirect()->route('real-estate.index')->with('success', 'Developer deleted successfully');
    }

    // Project CRUD
    public function createProject()
    {
        $developers = Developer::all();
        return Inertia::render('admin/real-estate/projects/create', [
            'developers' => $developers
        ]);
    }

    public function editProject($project)
    {
        $project = RealEstateProject::with('developer')->findOrFail($project);
        $developers = Developer::all();
        return Inertia::render('admin/real-estate/projects/edit', [
            'project' => $project,
            'developers' => $developers
        ]);
    }

    public function storeProject(Request $request)
    {
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
            'images' => 'nullable|array',
            'virtual_tour_url' => 'nullable|url',
            'featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['country'] = $validated['country'] ?? 'Philippines';

        RealEstateProject::create($validated);

        return redirect()->route('real-estate.index')->with('success', 'Project created successfully');
    }

    public function updateProject(Request $request, $project)
    {
        $project = RealEstateProject::findOrFail($project);

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
            'images' => 'nullable|array',
            'virtual_tour_url' => 'nullable|url',
            'featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['country'] = $validated['country'] ?? 'Philippines';

        $project->update($validated);

        return redirect()->route('real-estate.index')->with('success', 'Project updated successfully');
    }

    public function destroyProject($project)
    {
        $project = RealEstateProject::findOrFail($project);
        $project->delete();

        return redirect()->route('real-estate.index')->with('success', 'Project deleted successfully');
    }

    // Property CRUD
    public function storeProperty(Request $request)
    {
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

        $property = Property::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Property created successfully',
            'property' => $property->load('project.developer')
        ]);
    }

    public function updateProperty(Request $request, Property $property)
    {
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

        $property->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Property updated successfully',
            'property' => $property->load('project.developer')
        ]);
    }

    public function destroyProperty(Property $property)
    {
        $property->delete();

        return response()->json([
            'success' => true,
            'message' => 'Property deleted successfully'
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
            'pricing' => $pricing
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
            'pricing' => $pricing
        ]);
    }

    public function destroyPricing(PropertyPricing $pricing)
    {
        $pricing->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pricing deleted successfully'
        ]);
    }

    // Inquiry management
    public function updateInquiryStatus(Request $request, Inquiry $inquiry)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,contacted,viewing_scheduled,closed'
        ]);

        $inquiry->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Inquiry status updated successfully',
            'inquiry' => $inquiry->load('property.project')
        ]);
    }

    public function destroyInquiry(Inquiry $inquiry)
    {
        $inquiry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Inquiry deleted successfully'
        ]);
    }

    // Image upload
    public function uploadImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|file|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'type' => 'required|in:logo,property,project'
            ]);

            $image = $request->file('image');
            $type = $request->input('type');

            // Create directory path based on type
            $directory = "real-estate/{$type}s";

            // Generate unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();

            // Store the image
            $path = $image->storeAs($directory, $filename, 'public');

            // Generate URL
            $url = Storage::url($path);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'url' => $url,
                'path' => $path
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading image: ' . $e->getMessage()
            ], 500);
        }
    }
}
