<?php

use App\Models\Property;
use App\Models\PropertyPricing;
use App\Models\RealEstateProject;
use App\Models\User;

beforeEach(function () {
    $this->user = createAdminUser('property');
    $this->actingAs($this->user);

    $this->project = RealEstateProject::factory()->create();
    $this->property = Property::factory()->create(['project_id' => $this->project->id]);
});

it('can create property pricing', function () {
    $response = $this->postJson('/admin/real-estate/pricing', [
        'property_id' => $this->property->id,
        'total_contract_price' => 5000000,
        'currency' => 'PHP',
        'reservation_fee' => 50000,
        'downpayment_percentage' => 20,
        'equity_terms_months' => 24,
        'monthly_equity' => 83333.33,
        'payment_scheme_name' => 'Bank Financing',
    ]);

    $response->assertSuccessful()
        ->assertJsonFragment(['message' => 'Pricing created successfully']);

    $this->assertDatabaseHas('property_pricing', [
        'property_id' => $this->property->id,
        'total_contract_price' => 5000000,
        'payment_scheme_name' => 'Bank Financing',
    ]);
});

it('can update property pricing', function () {
    $pricing = PropertyPricing::factory()->create([
        'property_id' => $this->property->id,
    ]);

    $response = $this->putJson("/admin/real-estate/pricing/{$pricing->id}", [
        'property_id' => $this->property->id,
        'total_contract_price' => 6000000,
        'currency' => 'PHP',
        'payment_scheme_name' => 'Updated Scheme',
    ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('property_pricing', [
        'id' => $pricing->id,
        'total_contract_price' => 6000000,
        'payment_scheme_name' => 'Updated Scheme',
    ]);
});

it('can delete property pricing', function () {
    $pricing = PropertyPricing::factory()->create([
        'property_id' => $this->property->id,
    ]);

    $response = $this->deleteJson("/admin/real-estate/pricing/{$pricing->id}");

    $response->assertSuccessful();

    $this->assertDatabaseMissing('property_pricing', [
        'id' => $pricing->id,
    ]);
});

it('validates pricing data', function () {
    $this->postJson('/admin/real-estate/pricing', [
        'property_id' => 999999,
        'total_contract_price' => '',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['property_id', 'total_contract_price']);
});
