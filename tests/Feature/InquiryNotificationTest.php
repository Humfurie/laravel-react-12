<?php

use App\Mail\NewInquiryNotification;
use App\Models\Inquiry;
use App\Models\Property;
use App\Models\RealEstateProject;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->project = RealEstateProject::factory()->create();
    $this->property = Property::factory()->create(['project_id' => $this->project->id]);
});

it('sends email notification when inquiry is created', function () {
    Mail::fake();

    $this->postJson("/api/v1/properties/{$this->property->id}/inquiries", [
        'customer_name' => 'John Doe',
        'customer_email' => 'john@example.com',
        'customer_phone' => '1234567890',
        'inquiry_type' => Inquiry::TYPE_GENERAL,
        'message' => 'Interested in this property',
        'preferred_contact_time' => 'Morning',
    ])->assertCreated();

    Mail::assertSent(NewInquiryNotification::class, function ($mail) {
        return $mail->inquiry->customer_name === 'John Doe';
    });
});

it('creates inquiry with correct data', function () {
    Mail::fake();

    $response = $this->postJson("/api/v1/properties/{$this->property->id}/inquiries", [
        'customer_name' => 'Jane Smith',
        'customer_email' => 'jane@example.com',
        'customer_phone' => '0987654321',
        'inquiry_type' => Inquiry::TYPE_SITE_VISIT,
        'message' => 'Want to schedule a visit',
        'preferred_contact_time' => 'Afternoon',
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('inquiries', [
        'property_id' => $this->property->id,
        'customer_name' => 'Jane Smith',
        'customer_email' => 'jane@example.com',
        'inquiry_type' => Inquiry::TYPE_SITE_VISIT,
        'status' => Inquiry::STATUS_NEW,
    ]);
});

it('validates inquiry data', function () {
    $this->postJson("/api/v1/properties/{$this->property->id}/inquiries", [
        'customer_name' => '',
        'customer_email' => 'invalid-email',
        'customer_phone' => '',
        'inquiry_type' => 'invalid_type',
        'message' => '',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['customer_name', 'customer_email', 'customer_phone', 'inquiry_type', 'message']);
});
