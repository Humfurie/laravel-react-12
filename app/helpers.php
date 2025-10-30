<?php

use App\Models\Setting;

if (!function_exists('setting')) {
    /**
     * Get a setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    function setting(string $key, $default = null)
    {
        return Setting::get($key, $default);
    }
}

if (!function_exists('setting_file_url')) {
    /**
     * Get the full URL for a setting file
     *
     * @param string $key
     * @param string|null $default
     * @return string|null
     */
    function setting_file_url(string $key, ?string $default = null): ?string
    {
        $path = Setting::get($key);

        if (!$path) {
            return $default;
        }

        // If it's already a full URL, return as is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Otherwise, generate storage URL
        return \Illuminate\Support\Facades\Storage::disk('public')->url($path);
    }
}
