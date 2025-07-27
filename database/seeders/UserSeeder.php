<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $role = Role::where('slug', 'admin')->first();
        $user = User::factory()->create([
            'name' => config('app.user_account_name'),
            'email' => config('app.user_account_email'),
            'email_verified_at' => now(),
            'password' => config('app.user_account_password'),
        ]);

        $user->roles()->attach($role);
    }
}
