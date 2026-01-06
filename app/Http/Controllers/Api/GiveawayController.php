<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Giveaway;
use App\Models\GiveawayEntry;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class GiveawayController extends Controller
{
    /**
     * Get all active giveaways
     */
    public function index()
    {
        $giveaways = Giveaway::active()
            ->with(['images' => function ($query) {
                $query->ordered();
            }])
            ->withCount('entries')
            ->get()
            ->map(function ($giveaway) {
                return [
                    'id' => $giveaway->id,
                    'title' => $giveaway->title,
                    'slug' => $giveaway->slug,
                    'description' => $giveaway->description,
                    'start_date' => $giveaway->start_date,
                    'end_date' => $giveaway->end_date,
                    'number_of_winners' => $giveaway->number_of_winners,
                    'is_active' => $giveaway->is_active,
                    'can_accept_entries' => $giveaway->can_accept_entries,
                    'entries_count' => $giveaway->entries_count,
                    'images' => $giveaway->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                            'order' => $image->order,
                        ];
                    }),
                    'primary_image_url' => $giveaway->primary_image_url,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $giveaways,
        ]);
    }

    /**
     * Get a specific giveaway by slug
     */
    public function show(Giveaway $giveaway)
    {
        // Check if giveaway is accessible (not draft)
        if ($giveaway->status === Giveaway::STATUS_DRAFT) {
            return response()->json([
                'success' => false,
                'message' => 'Giveaway not found.',
            ], 404);
        }

        $giveaway->loadCount(['entries', 'winners'])->load(['images' => function ($query) {
            $query->ordered();
        }, 'winner', 'winners']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $giveaway->id,
                'title' => $giveaway->title,
                'slug' => $giveaway->slug,
                'description' => $giveaway->description,
                'start_date' => $giveaway->start_date,
                'end_date' => $giveaway->end_date,
                'number_of_winners' => $giveaway->number_of_winners,
                'status' => $giveaway->status,
                'is_active' => $giveaway->is_active,
                'has_ended' => $giveaway->has_ended,
                'can_accept_entries' => $giveaway->can_accept_entries,
                'entries_count' => $giveaway->entries_count,
                'winner' => $giveaway->winner ? [
                    'name' => $giveaway->winner->name,
                ] : null,
                'winners' => $giveaway->winners->map(function ($winner) {
                    return [
                        'name' => $winner->name,
                    ];
                }),
                'winners_count' => $giveaway->winners_count,
                'images' => $giveaway->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                        'is_primary' => $image->is_primary,
                        'order' => $image->order,
                    ];
                }),
                'primary_image_url' => $giveaway->primary_image_url,
            ],
        ]);
    }

    /**
     * Submit an entry for a giveaway
     */
    public function submitEntry(Request $request, Giveaway $giveaway)
    {
        // Check if giveaway can accept entries
        if (!$giveaway->canAcceptEntries()) {
            return response()->json([
                'success' => false,
                'message' => 'This giveaway is not currently accepting entries.',
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
                    function ($attribute, $value, $fail) use ($giveaway) {
                        // Normalize phone number for comparison
                        // Convert 09XXXXXXXXX to +639XXXXXXXXX format
                        $normalizedInput = $value;
                        if (str_starts_with($value, '09')) {
                            $normalizedInput = '+63' . substr($value, 1);
                        }

                        // Check if phone already exists for this giveaway (in any format)
                        $exists = GiveawayEntry::where('giveaway_id', $giveaway->id)
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
                            $fail('This phone number has already been registered for this giveaway.');
                        }
                    },
                ],
                'facebook_url' => 'required|url|max:500',
                'screenshot' => 'required|image|mimes:jpeg,jpg,png|max:5120',
            ], [
                'phone.regex' => 'Phone number must be in format 09XXXXXXXXX or +639XXXXXXXXX',
                'screenshot.image' => 'Screenshot must be an image.',
                'screenshot.mimes' => 'Screenshot must be a JPEG, JPG, or PNG file.',
                'screenshot.max' => 'Screenshot must not be larger than 5MB.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        }

        // Normalize phone number to +639XXXXXXXXX format before storing
        $normalizedPhone = $validated['phone'];
        if (str_starts_with($validated['phone'], '09')) {
            $normalizedPhone = '+63' . substr($validated['phone'], 1);
        }

        // Handle screenshot upload
        $screenshotPath = null;
        if ($request->hasFile('screenshot')) {
            $screenshot = $request->file('screenshot');
            $phoneHash = md5($normalizedPhone);
            $filename = "giveaway_{$giveaway->id}_{$phoneHash}." . $screenshot->getClientOriginalExtension();

            // Use Storage facade to ensure compatibility with Storage::fake() in tests
            $screenshotPath = Storage::disk('minio')->putFileAs('screenshots', $screenshot, $filename);
        }

        DB::beginTransaction();
        try {
            $entry = $giveaway->entries()->create([
                'name' => $validated['name'],
                'phone' => $normalizedPhone,
                'facebook_url' => $validated['facebook_url'],
                'screenshot_path' => $screenshotPath,
                'status' => GiveawayEntry::STATUS_PENDING,
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
        } catch (Exception $e) {
            DB::rollBack();

            // Check if it's a unique constraint violation
            if (str_contains($e->getMessage(), 'Unique violation') || str_contains($e->getMessage(), 'Duplicate entry')) {
                return response()->json([
                    'success' => false,
                    'message' => 'This phone number has already been registered for this giveaway.',
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit entry. Please try again.',
            ], 500);
        }
    }

    /**
     * Get all giveaways with winners (completed giveaways)
     */
    public function winners()
    {
        $giveaways = Giveaway::ended()
            ->whereNotNull('winner_id')
            ->with(['winner', 'winners', 'images' => function ($query) {
                $query->primary();
            }])
            ->withCount(['entries', 'winners'])
            ->orderBy('end_date', 'desc')
            ->get()
            ->map(function ($giveaway) {
                return [
                    'id' => $giveaway->id,
                    'title' => $giveaway->title,
                    'slug' => $giveaway->slug,
                    'end_date' => $giveaway->end_date,
                    'number_of_winners' => $giveaway->number_of_winners,
                    'winner' => [
                        'name' => $giveaway->winner->name,
                    ],
                    'winners' => $giveaway->winners->map(function ($winner) {
                        return [
                            'name' => $winner->name,
                        ];
                    }),
                    'winners_count' => $giveaway->winners_count,
                    'primary_image_url' => $giveaway->primary_image_url,
                    'entries_count' => $giveaway->entries_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $giveaways,
        ]);
    }

    /**
     * Check if a phone number has already entered a giveaway
     */
    public function checkPhone(Request $request, Giveaway $giveaway)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        // Normalize phone number for checking
        $phone = $request->phone;
        if (str_starts_with($phone, '09')) {
            $phone = '+63' . substr($phone, 1);
        }

        $exists = GiveawayEntry::where('giveaway_id', $giveaway->id)
            ->where('phone', $phone)
            ->exists();

        return response()->json([
            'exists' => $exists,
        ]);
    }
}
