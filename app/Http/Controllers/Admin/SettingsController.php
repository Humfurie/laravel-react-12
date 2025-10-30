<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::getAllGrouped();

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'allSettings' => Setting::orderBy('group')->orderBy('key')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            $setting = Setting::where('key', $key)->first();

            if (!$setting) {
                continue;
            }

            // Handle file uploads
            if ($setting->type === 'file' && $request->hasFile("files.{$key}")) {
                $file = $request->file("files.{$key}");

                // Delete old file if exists
                if ($setting->value && Storage::disk('public')->exists($setting->value)) {
                    Storage::disk('public')->delete($setting->value);
                }

                // Store new file
                $path = $file->store('settings', 'public');
                $value = $path;
            }

            Setting::set(
                $key,
                $value,
                $setting->type,
                $setting->group,
                $setting->description
            );
        }

        Setting::clearCache();

        return redirect()->back()->with('success', 'Settings updated successfully');
    }

    public function uploadFile(Request $request, string $key)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $setting = Setting::where('key', $key)->first();

        if (!$setting || $setting->type !== 'file') {
            return response()->json(['error' => 'Invalid setting key'], 400);
        }

        // Delete old file if exists
        if ($setting->value && Storage::disk('public')->exists($setting->value)) {
            Storage::disk('public')->delete($setting->value);
        }

        // Store new file
        $path = $request->file('file')->store('settings', 'public');

        Setting::set($key, $path, 'file', $setting->group, $setting->description);

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
