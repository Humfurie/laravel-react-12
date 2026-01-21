<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // Handle resume upload
        if ($request->hasFile('resume')) {
            // Delete old resume if exists
            if ($user->resume_path) {
                $this->deleteFile($user->resume_path);
            }

            // Use public disk for local, minio for production
            $disk = app()->environment('local') ? 'public' : 'minio';
            $path = $request->file('resume')->store('resumes/'.$user->id, $disk);
            $validated['resume_path'] = $path;
        }

        // Handle about image upload
        if ($request->hasFile('about_image')) {
            // Delete old image if exists
            if ($user->about_image_path) {
                $this->deleteFile($user->about_image_path);
            }

            // Use public disk for local, minio for production
            $disk = app()->environment('local') ? 'public' : 'minio';
            $path = $request->file('about_image')->store('about-images/'.$user->id, $disk);
            $validated['about_image_path'] = $path;
        }

        // Remove file fields from validated data (handled separately)
        unset($validated['resume'], $validated['about_image']);

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    /**
     * Delete a file from storage.
     */
    public function deleteFile(?string $path): void
    {
        if (! $path) {
            return;
        }

        $disk = app()->environment('local') ? 'public' : 'minio';
        if (Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    /**
     * Remove resume from profile.
     */
    public function removeResume(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->resume_path) {
            $this->deleteFile($user->resume_path);
            $user->update(['resume_path' => null]);
        }

        return to_route('profile.edit');
    }

    /**
     * Remove about image from profile.
     */
    public function removeAboutImage(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->about_image_path) {
            $this->deleteFile($user->about_image_path);
            $user->update(['about_image_path' => null]);
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
