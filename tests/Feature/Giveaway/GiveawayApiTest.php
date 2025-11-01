<?php

namespace Tests\Feature\Giveaway;

use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GiveawayApiTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_can_list_active_giveaways(): void
    {
        Giveaway::factory()->active()->count(3)->create();
        Giveaway::factory()->draft()->create(); // Should not appear
        Giveaway::factory()->ended()->create(); // Should not appear

        $response = $this->getJson('/api/v1/giveaways');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_show_a_giveaway(): void
    {
        $giveaway = Giveaway::factory()->active()->create([
            'title' => 'iPhone Giveaway',
        ]);

        $response = $this->getJson("/api/v1/giveaways/{$giveaway->slug}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'title' => 'iPhone Giveaway',
                    'slug' => $giveaway->slug,
                ],
            ]);
    }

    /** @test */
    public function it_cannot_show_draft_giveaway(): void
    {
        $giveaway = Giveaway::factory()->draft()->create();

        $response = $this->getJson("/api/v1/giveaways/{$giveaway->slug}");

        $response->assertNotFound();
    }

    /** @test */
    public function it_can_submit_entry_to_active_giveaway(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $entryData = [
            'name' => 'Juan Dela Cruz',
            'phone' => '09123456789',
            'facebook_url' => 'https://facebook.com/juan.delacruz',
        ];

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", $entryData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Your entry has been submitted successfully!',
            ]);

        // Phone should be normalized in database
        $this->assertDatabaseHas('giveaway_entries', [
            'giveaway_id' => $giveaway->id,
            'name' => 'Juan Dela Cruz',
            'phone' => '+639123456789', // Normalized
            'facebook_url' => 'https://facebook.com/juan.delacruz',
        ]);
    }

    /** @test */
    public function it_normalizes_phone_number_starting_with_09(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Maria Santos',
            'phone' => '09987654321',
            'facebook_url' => 'https://facebook.com/maria',
        ]);

        $response->assertStatus(201);

        // Should normalize 09 to +639
        $this->assertDatabaseHas('giveaway_entries', [
            'phone' => '+639987654321',
        ]);
    }

    /** @test */
    public function it_accepts_phone_number_already_in_normalized_format(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Pedro Ramos',
            'phone' => '+639111222333',
            'facebook_url' => 'https://facebook.com/pedro',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('giveaway_entries', [
            'phone' => '+639111222333',
        ]);
    }

    /** @test */
    public function it_prevents_duplicate_phone_number_for_same_giveaway(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        // First entry
        GiveawayEntry::factory()->create([
            'giveaway_id' => $giveaway->id,
            'phone' => '+639123456789',
        ]);

        // Try to submit with same phone
        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Another Person',
            'phone' => '09123456789', // Same number (will be normalized to +639123456789)
            'facebook_url' => 'https://facebook.com/another',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    /** @test */
    public function it_allows_same_phone_number_for_different_giveaways(): void
    {
        $giveaway1 = Giveaway::factory()->active()->create();
        $giveaway2 = Giveaway::factory()->active()->create();

        $phone = '+639123456789';

        // First entry in giveaway 1
        GiveawayEntry::factory()->create([
            'giveaway_id' => $giveaway1->id,
            'phone' => $phone,
        ]);

        // Same phone in giveaway 2 should be allowed
        $response = $this->postJson("/api/v1/giveaways/{$giveaway2->slug}/enter", [
            'name' => 'Juan Dela Cruz',
            'phone' => '09123456789',
            'facebook_url' => 'https://facebook.com/juan',
        ]);

        $response->assertStatus(201);
    }

    /** @test */
    public function it_validates_required_fields(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'phone', 'facebook_url']);
    }

    /** @test */
    public function it_validates_phone_format(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Test User',
            'phone' => 'invalid-phone',
            'facebook_url' => 'https://facebook.com/test',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    /** @test */
    public function it_validates_facebook_url_format(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Test User',
            'phone' => '09123456789',
            'facebook_url' => 'not-a-url',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['facebook_url']);
    }

    /** @test */
    public function it_cannot_submit_entry_to_ended_giveaway(): void
    {
        $giveaway = Giveaway::factory()->ended()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Juan Dela Cruz',
            'phone' => '09123456789',
            'facebook_url' => 'https://facebook.com/juan',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'This giveaway is not currently accepting entries.',
            ]);
    }

    /** @test */
    public function it_cannot_submit_entry_to_upcoming_giveaway(): void
    {
        $giveaway = Giveaway::factory()->upcoming()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Juan Dela Cruz',
            'phone' => '09123456789',
            'facebook_url' => 'https://facebook.com/juan',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'This giveaway is not currently accepting entries.',
            ]);
    }

    /** @test */
    public function it_can_check_if_phone_already_entered(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        GiveawayEntry::factory()->create([
            'giveaway_id' => $giveaway->id,
            'phone' => '+639123456789',
        ]);

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/check-phone", [
            'phone' => '09123456789',
        ]);

        $response->assertOk()
            ->assertJson([
                'exists' => true,
            ]);
    }

    /** @test */
    public function it_can_check_if_phone_not_entered(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $response = $this->postJson("/api/v1/giveaways/{$giveaway->slug}/check-phone", [
            'phone' => '09999999999',
        ]);

        $response->assertOk()
            ->assertJson([
                'exists' => false,
            ]);
    }

    /** @test */
    public function it_can_list_giveaways_with_winners(): void
    {
        Giveaway::factory()->withWinner()->count(2)->create();
        Giveaway::factory()->active()->create(); // No winner

        $response = $this->getJson('/api/v1/giveaways/winners');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    /** @test */
    public function it_includes_entries_count_in_giveaway_list(): void
    {
        $giveaway = Giveaway::factory()->active()->create();
        GiveawayEntry::factory(5)->create(['giveaway_id' => $giveaway->id]);

        $response = $this->getJson('/api/v1/giveaways');

        $response->assertOk()
            ->assertJsonPath('data.0.entries_count', 5);
    }

    /** @test */
    public function it_sets_entry_status_to_pending_by_default(): void
    {
        $giveaway = Giveaway::factory()->active()->create();

        $this->postJson("/api/v1/giveaways/{$giveaway->slug}/enter", [
            'name' => 'Test User',
            'phone' => '09123456789',
            'facebook_url' => 'https://facebook.com/test',
        ]);

        $this->assertDatabaseHas('giveaway_entries', [
            'giveaway_id' => $giveaway->id,
            'status' => GiveawayEntry::STATUS_PENDING,
        ]);
    }
}
