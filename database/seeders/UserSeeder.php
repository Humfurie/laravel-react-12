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

        $user = User::firstOrCreate(
            ['email' => config('app.user_account_email')],
            [
                'name' => config('app.user_account_name'),
                'email' => config('app.user_account_email'),
                'email_verified_at' => now(),
                'password' => config('app.user_account_password'),
                'mobile' => config('app.user_account_mobile', '09397535416'),
                'telephone' => config('app.user_account_telephone', '0322669051'),
            ]
        );

        if ($role && !$user->roles()->where('role_id', $role->id)->exists()) {
            $user->roles()->attach($role->id);
        }
    }
}
