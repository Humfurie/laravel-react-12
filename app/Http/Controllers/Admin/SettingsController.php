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
        $disk = config('filesystems.default');

        // Add URL field to file-type settings for proper display
        $allSettings = Setting::orderBy('group')->orderBy('key')->get()->map(function ($setting) use ($disk) {
            $settingArray = $setting->toArray();

            // Add URL for file-type settings
            if ($setting->type === 'file' && $setting->value) {
                $settingArray['url'] = $this->generateFileUrl($disk, $setting->value);
            }

            return $settingArray;
        });

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
            'allSettings' => $allSettings,
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

            // Skip file settings as they are handled separately via uploadFile
            if ($setting->type === 'file') {
                continue;
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

        // Determine which disk to use based on configuration
        $disk = config('filesystems.default');

        // Delete old file if exists
        if ($setting->value) {
            if (Storage::disk($disk)->exists($setting->value)) {
                Storage::disk($disk)->delete($setting->value);
            }
        }

        // Store new file
        $path = $request->file('file')->store('settings', $disk);

        Setting::set($key, $path, 'file', $setting->group, $setting->description);

        // Generate the proper URL based on disk
        $url = $this->generateFileUrl($disk, $path);

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => $url,
        ]);
    }

    /**
     * Generate proper file URL based on disk configuration
     */
    private function generateFileUrl(string $disk, string $path): string
    {
        if ($disk === 'minio') {
            // In production with MinIO, use the Storage URL method
            return Storage::disk('minio')->url($path);
        }

        // In local with public disk, use the standard /storage URL
        return Storage::disk('public')->url($path);
    }
}
