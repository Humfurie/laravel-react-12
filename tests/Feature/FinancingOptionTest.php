<?php

use App\Models\FinancingOption;
use App\Models\Property;
use App\Models\PropertyPricing;
use App\Models\RealEstateProject;
use App\Models\User;

beforeEach(function () {
    $this->user = createAdminUser('property');
    $this->actingAs($this->user);

    $project = RealEstateProject::factory()->create();
    $property = Property::factory()->create(['project_id' => $project->id]);
    $this->pricing = PropertyPricing::factory()->create(['property_id' => $property->id]);
});

it('can create financing option', function () {
    $response = $this->postJson('/admin/real-estate/financing-options', [
        'property_pricing_id' => $this->pricing->id,
        'bank_name' => 'BDO',
        'loan_to_value_ratio' => 80,
        'interest_rate' => 5.5,
        'loan_term_years' => 20,
        'monthly_amortization' => 25000,
        'processing_fee' => 15000,
        'requirements' => ['Valid ID', 'Proof of Income', 'ITR'],
        'is_active' => true,
    ]);

    $response->assertSuccessful()
        ->assertJsonFragment(['message' => 'Financing option created successfully']);

    $this->assertDatabaseHas('financing_options', [
        'property_pricing_id' => $this->pricing->id,
        'bank_name' => 'BDO',
        'loan_term_years' => 20,
    ]);
});

it('can update financing option', function () {
    $option = FinancingOption::factory()->create([
        'property_pricing_id' => $this->pricing->id,
    ]);

    $response = $this->putJson("/admin/real-estate/financing-options/{$option->id}", [
        'property_pricing_id' => $this->pricing->id,
        'bank_name' => 'BPI',
        'loan_term_years' => 25,
        'interest_rate' => 6.0,
        'is_active' => true,
    ]);

    $response->assertSuccessful();

    $this->assertDatabaseHas('financing_options', [
        'id' => $option->id,
        'bank_name' => 'BPI',
        'loan_term_years' => 25,
    ]);
});

it('can delete financing option', function () {
    $option = FinancingOption::factory()->create([
        'property_pricing_id' => $this->pricing->id,
    ]);

    $response = $this->deleteJson("/admin/real-estate/financing-options/{$option->id}");

    $response->assertSuccessful();

    $this->assertDatabaseMissing('financing_options', [
        'id' => $option->id,
    ]);
});

it('validates financing option data', function () {
    $this->postJson('/admin/real-estate/financing-options', [
        'property_pricing_id' => 999999,
        'bank_name' => '',
        'loan_term_years' => '',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['property_pricing_id', 'bank_name', 'loan_term_years']);
});
