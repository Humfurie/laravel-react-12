<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;

class UpgradeFirstUserToSuperAdmin extends Command
{
    protected $signature = 'user:upgrade-to-super-admin {email?}';
    protected $description = 'Upgrade a user from Admin to Super Admin role';

    public function handle(): int
    {
        $email = $this->argument('email') ?? config('app.user_account_email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' not found.");
            return self::FAILURE;
        }

        $adminRole = Role::where('slug', 'admin')->first();
        $superAdminRole = Role::where('slug', 'super-admin')->first();

        if (!$superAdminRole) {
            $this->error('Super Admin role not found. Please run RoleSeeder first.');
            return self::FAILURE;
        }

        $this->info("User: {$user->email}");
        $this->info("Current roles: " . $user->roles->pluck('name')->implode(', '));

        // Remove admin role if exists
        if ($adminRole && $user->roles()->where('role_id', $adminRole->id)->exists()) {
            $user->roles()->detach($adminRole->id);
            $this->info('✓ Removed Admin role');
        }

        // Add super admin role if not exists
        if (!$user->roles()->where('role_id', $superAdminRole->id)->exists()) {
            $user->roles()->attach($superAdminRole->id);
            $this->info('✓ Attached Super Admin role');
        } else {
            $this->warn('User already has Super Admin role');
        }

        $user->refresh();
        $this->info("New roles: " . $user->roles->pluck('name')->implode(', '));
        $this->newLine();
        $this->info('✓ Successfully upgraded user to Super Admin!');

        return self::SUCCESS;
    }
}
