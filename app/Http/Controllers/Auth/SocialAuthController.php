<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GitHubService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    protected array $supportedProviders = ['google', 'facebook', 'github'];

    public function __construct(
        protected GitHubService $githubService
    )
    {
    }

    /**
     * Redirect to OAuth provider.
     */
    public function redirect(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return redirect()->route('login')
                ->withErrors(['provider' => 'Unsupported authentication provider.']);
        }

        // Store intended redirect URL for post-auth navigation (e.g., guestbook)
        if (request()->has('intended')) {
            session()->put('url.intended', request()->input('intended'));
        }

        $scopes = $this->getScopes($provider);

        return Socialite::driver($provider)
            ->scopes($scopes)
            ->redirect();
    }

    /**
     * Handle OAuth callback.
     */
    public function callback(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return redirect()->route('login')
                ->withErrors(['provider' => 'Unsupported authentication provider.']);
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
            $user = $this->findOrCreateUser($socialUser, $provider);

            // Fetch GitHub contributions if logging in with GitHub
            if ($provider === 'github' && $user->github_username) {
                $this->syncGitHubContributions($user);
            }

            Auth::login($user, remember: true);

            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            Log::error("Social auth error for {$provider}: " . $e->getMessage());

            return redirect()->route('login')
                ->withErrors(['social' => 'Unable to authenticate. Please try again.']);
        }
    }

    /**
     * Find existing user or create a new one.
     */
    protected function findOrCreateUser($socialUser, string $provider): User
    {
        $providerIdColumn = "{$provider}_id";

        // First, check if user exists with this provider ID
        $user = User::where($providerIdColumn, $socialUser->getId())->first();

        if ($user) {
            // Update avatar if changed
            if ($socialUser->getAvatar() && $user->avatar_url !== $socialUser->getAvatar()) {
                $user->update(['avatar_url' => $socialUser->getAvatar()]);
            }

            return $user;
        }

        // Check if user exists with this email
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Link provider to existing account
            $updateData = [
                $providerIdColumn => $socialUser->getId(),
            ];

            // Update avatar if not set
            if (!$user->avatar_url && $socialUser->getAvatar()) {
                $updateData['avatar_url'] = $socialUser->getAvatar();
            }

            // For GitHub, also store the username
            if ($provider === 'github' && $socialUser->getNickname()) {
                $updateData['github_username'] = $socialUser->getNickname();
            }

            $user->update($updateData);

            return $user;
        }

        // Create new user
        $userData = [
            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
            'email' => $socialUser->getEmail(),
            'password' => bcrypt(Str::random(32)), // Random password for social users
            'email_verified_at' => now(), // Social accounts are pre-verified
            'avatar_url' => $socialUser->getAvatar(),
            $providerIdColumn => $socialUser->getId(),
        ];

        // Generate a unique username
        $baseUsername = $this->generateUsername($socialUser, $provider);
        $userData['username'] = $this->ensureUniqueUsername($baseUsername);

        // For GitHub, store the username
        if ($provider === 'github' && $socialUser->getNickname()) {
            $userData['github_username'] = $socialUser->getNickname();
        }

        return User::create($userData);
    }

    /**
     * Generate a username from social profile.
     */
    protected function generateUsername($socialUser, string $provider): string
    {
        // Prefer nickname/username from provider
        if ($socialUser->getNickname()) {
            return Str::slug($socialUser->getNickname());
        }

        // Fall back to name
        if ($socialUser->getName()) {
            return Str::slug($socialUser->getName());
        }

        // Last resort: use email prefix
        $email = $socialUser->getEmail();
        if ($email) {
            return Str::slug(explode('@', $email)[0]);
        }

        return 'user-' . Str::random(8);
    }

    /**
     * Ensure username is unique by appending numbers if needed.
     */
    protected function ensureUniqueUsername(string $username): string
    {
        $originalUsername = $username;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $originalUsername . '-' . $counter;
            $counter++;
        }

        return $username;
    }

    /**
     * Get OAuth scopes for provider.
     */
    protected function getScopes(string $provider): array
    {
        return match ($provider) {
            'github' => ['read:user', 'user:email'],
            'google' => ['email', 'profile'],
            'facebook' => ['email', 'public_profile'],
            default => [],
        };
    }

    /**
     * Sync GitHub contribution data for user.
     */
    protected function syncGitHubContributions(User $user): void
    {
        try {
            $contributions = $this->githubService->getUserContributions($user->github_username);

            if ($contributions) {
                $user->update([
                    'github_contributions' => $contributions,
                    'github_synced_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            Log::warning("Failed to sync GitHub contributions for user {$user->id}: " . $e->getMessage());
        }
    }

    /**
     * Link a social provider to existing authenticated user.
     */
    public function link(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return back()->withErrors(['provider' => 'Unsupported authentication provider.']);
        }

        return Socialite::driver($provider)
            ->scopes($this->getScopes($provider))
            ->redirect();
    }

    /**
     * Handle linking callback for authenticated user.
     */
    public function linkCallback(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return redirect()->route('profile.edit')
                ->withErrors(['provider' => 'Unsupported authentication provider.']);
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
            $user = Auth::user();
            $providerIdColumn = "{$provider}_id";

            // Check if this social account is already linked to another user
            $existingUser = User::where($providerIdColumn, $socialUser->getId())
                ->where('id', '!=', $user->id)
                ->first();

            if ($existingUser) {
                return redirect()->route('profile.edit')
                    ->withErrors(['social' => 'This account is already linked to another user.']);
            }

            // Link the provider
            $updateData = [$providerIdColumn => $socialUser->getId()];

            if ($provider === 'github' && $socialUser->getNickname()) {
                $updateData['github_username'] = $socialUser->getNickname();

                // Sync contributions
                $this->syncGitHubContributions($user);
            }

            if (!$user->avatar_url && $socialUser->getAvatar()) {
                $updateData['avatar_url'] = $socialUser->getAvatar();
            }

            $user->update($updateData);

            return redirect()->route('profile.edit')
                ->with('status', ucfirst($provider) . ' account linked successfully.');
        } catch (\Exception $e) {
            Log::error("Social link error for {$provider}: " . $e->getMessage());

            return redirect()->route('profile.edit')
                ->withErrors(['social' => 'Unable to link account. Please try again.']);
        }
    }

    /**
     * Unlink a social provider from authenticated user.
     */
    public function unlink(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders)) {
            return back()->withErrors(['provider' => 'Unsupported authentication provider.']);
        }

        $user = Auth::user();
        $providerIdColumn = "{$provider}_id";

        // Ensure user has another way to login (password or another provider)
        $hasPassword = $user->password !== null;
        $linkedProviders = collect($this->supportedProviders)
            ->filter(fn($p) => $user->{"{$p}_id"} !== null)
            ->count();

        if (!$hasPassword && $linkedProviders <= 1) {
            return back()->withErrors([
                'social' => 'You must set a password or link another account before unlinking this provider.',
            ]);
        }

        $updateData = [$providerIdColumn => null];

        if ($provider === 'github') {
            $updateData['github_username'] = null;
            $updateData['github_contributions'] = null;
            $updateData['github_synced_at'] = null;
        }

        $user->update($updateData);

        return back()->with('status', ucfirst($provider) . ' account unlinked.');
    }
}
