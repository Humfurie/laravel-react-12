<?php

namespace App\Http\Requests;

use App\Models\Property;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $property = $this->route('property');

        return auth()->check() && auth()->user()->can('update', $property);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $property = $this->route('property');

        return [
            // All fields optional for updates, at least one required
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'min:50'],
            'project_id' => ['sometimes', 'exists:real_estate_projects,id'],
            'property_type' => ['sometimes', 'string', Rule::in([
                Property::PROPERTY_TYPE_STUDIO,
                Property::PROPERTY_TYPE_1BR,
                Property::PROPERTY_TYPE_2BR,
                Property::PROPERTY_TYPE_3BR,
                Property::PROPERTY_TYPE_PENTHOUSE,
            ])],
            'listing_status' => ['sometimes', 'string', Rule::in([
                Property::LISTING_STATUS_AVAILABLE,
                Property::LISTING_STATUS_RESERVED,
                Property::LISTING_STATUS_SOLD,
                Property::LISTING_STATUS_NOT_AVAILABLE,
            ])],

            // Unit Details
            'unit_number' => ['nullable', 'string', 'max:50'],
            'floor_level' => ['nullable', 'integer', 'min:1', 'max:200'],
            'building_phase' => ['nullable', 'string', 'max:50'],

            // Dimensions
            'floor_area' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'floor_area_unit' => ['nullable', 'string', 'max:10'],
            'balcony_area' => ['nullable', 'numeric', 'min:0', 'max:1000'],

            // Room Details
            'bedrooms' => ['nullable', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['nullable', 'numeric', 'min:0', 'max:20'],
            'parking_spaces' => ['nullable', 'integer', 'min:0', 'max:10'],

            // Orientation & View
            'orientation' => ['nullable', 'string', Rule::in([
                Property::ORIENTATION_NORTH,
                Property::ORIENTATION_SOUTH,
                Property::ORIENTATION_EAST,
                Property::ORIENTATION_WEST,
            ])],
            'view_type' => ['nullable', 'string', 'max:100'],

            // Features
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'floor_plan_url' => ['nullable', 'url', 'max:500'],
            'featured' => ['boolean'],

            // Legacy/Compatibility fields
            'status' => ['nullable', 'string', Rule::in(['available', 'pending', 'sold', 'rented'])],
            'listing_type' => ['nullable', 'string', Rule::in(['sale', 'rent', 'lease'])],
            'price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Property title cannot exceed 255 characters.',
            'description.min' => 'Description must be at least 50 characters.',
            'project_id.exists' => 'The selected project does not exist.',
            'floor_area.numeric' => 'Floor area must be a number.',
            'floor_area.min' => 'Floor area cannot be negative.',
            'floor_level.integer' => 'Floor level must be a whole number.',
            'floor_level.min' => 'Floor level must be at least 1.',
            'bedrooms.integer' => 'Number of bedrooms must be a whole number.',
            'bathrooms.numeric' => 'Number of bathrooms must be a number.',
            'parking_spaces.integer' => 'Number of parking spaces must be a whole number.',
            'latitude.between' => 'Latitude must be between -90 and 90.',
            'longitude.between' => 'Longitude must be between -180 and 180.',
            'contact_email.email' => 'Please provide a valid email address.',
        ];
    }
}
