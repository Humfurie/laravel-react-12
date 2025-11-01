<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Raffle;
use App\Models\RaffleEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RaffleController extends Controller
{
    /**
     * Get all active raffles
     */
    public function index()
    {
        $raffles = Raffle::active()
            ->with(['images' => function ($query) {
                $query->ordered();
            }])
            ->withCount('entries')
            ->get()
            ->map(function ($raffle) {
                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'description' => $raffle->description,
                    'start_date' => $raffle->start_date,
                    'end_date' => $raffle->end_date,
                    'is_active' => $raffle->is_active,
                    'can_accept_entries' => $raffle->can_accept_entries,
                    'entries_count' => $raffle->entries_count,
                    'images' => $raffle->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                            'order' => $image->order,
                        ];
                    }),
                    'primary_image_url' => $raffle->primary_image_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $raffles,
        ]);
    }

    /**
     * Get a specific raffle by slug
     */
    public function show(Raffle $raffle)
    {
        // Check if raffle is accessible (not draft)
        if ($raffle->status === Raffle::STATUS_DRAFT) {
            return response()->json([
                'success' => false,
                'message' => 'Raffle not found.',
            ], 404);
        }

        $raffle->load(['images' => function ($query) {
            $query->ordered();
        }, 'winner']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $raffle->id,
                'title' => $raffle->title,
                'slug' => $raffle->slug,
                'description' => $raffle->description,
                'start_date' => $raffle->start_date,
                'end_date' => $raffle->end_date,
                'status' => $raffle->status,
                'is_active' => $raffle->is_active,
                'has_ended' => $raffle->has_ended,
                'can_accept_entries' => $raffle->can_accept_entries,
                'entries_count' => $raffle->entries->count(),
                'winner' => $raffle->winner ? [
                    'name' => $raffle->winner->name,
                ] : null,
                'images' => $raffle->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'order' => $image->order,
                    ];
                }),
                'primary_image_url' => $raffle->primary_image_url,
            ],
        ]);
    }

    /**
     * Submit an entry for a raffle
     */
    public function submitEntry(Request $request, Raffle $raffle)
    {
        // Check if raffle can accept entries
        if (!$raffle->canAcceptEntries()) {
            return response()->json([
                'success' => false,
                'message' => 'This raffle is not currently accepting entries.',
            ], 400);
        }

        // Validate request
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'phone' => [
                    'required',
                    'string',
                    'regex:/^(\+639|09)\d{9}$/',
                    function ($attribute, $value, $fail) use ($raffle) {
                        // Normalize phone number for comparison
                        // Convert 09XXXXXXXXX to +639XXXXXXXXX format
                        $normalizedInput = $value;
                        if (str_starts_with($value, '09')) {
                            $normalizedInput = '+63' . substr($value, 1);
                        }

                        // Check if phone already exists for this raffle (in any format)
                        $exists = RaffleEntry::where('raffle_id', $raffle->id)
                            ->where(function ($query) use ($normalizedInput) {
                                // Check both formats
                                $query->where('phone', $normalizedInput);

                                // Also check the 09 format if input was +639
                                if (str_starts_with($normalizedInput, '+639')) {
                                    $altFormat = '0' . substr($normalizedInput, 3);
                                    $query->orWhere('phone', $altFormat);
                                }
                            })
                            ->exists();

                        if ($exists) {
                            $fail('This phone number has already been registered for this raffle.');
                        }
                    },
                ],
                'facebook_url' => 'required|url|max:500',
            ], [
                'phone.regex' => 'Phone number must be in format 09XXXXXXXXX or +639XXXXXXXXX',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }

        DB::beginTransaction();
        try {
            $entry = $raffle->entries()->create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'facebook_url' => $validated['facebook_url'],
                'status' => RaffleEntry::STATUS_PENDING,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Your entry has been submitted successfully!',
                'data' => [
                    'id' => $entry->id,
                    'name' => $entry->name,
                    'entry_date' => $entry->entry_date,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            // Check if it's a unique constraint violation
            if (str_contains($e->getMessage(), 'Unique violation') || str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'success' => false,
                    'message' => 'This phone number has already been registered for this raffle.',
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit entry. Please try again.',
            ], 500);
        }
    }

    /**
     * Get all raffles with winners (completed raffles)
     */
    public function winners()
    {
        $raffles = Raffle::ended()
            ->whereNotNull('winner_id')
            ->with(['winner', 'images' => function ($query) {
                $query->primary();
            }])
            ->orderBy('end_date', 'desc')
            ->get()
            ->map(function ($raffle) {
                return [
                    'id' => $raffle->id,
                    'title' => $raffle->title,
                    'slug' => $raffle->slug,
                    'end_date' => $raffle->end_date,
                    'winner' => [
                        'name' => $raffle->winner->name,
                    ],
                    'primary_image_url' => $raffle->primary_image_url,
                    'entries_count' => $raffle->entries->count(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $raffles,
        ]);
    }

    /**
     * Check if a phone number has already entered a raffle
     */
    public function checkPhone(Request $request, Raffle $raffle)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $exists = RaffleEntry::where('raffle_id', $raffle->id)
            ->where('phone', $request->phone)
            ->exists();

        return response()->json([
            'exists' => $exists,
        ]);
    }
}
