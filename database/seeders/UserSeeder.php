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
        User::factory()->create([
            'name' => 'Humphrey',
            'email' => 'humfurie@gmail.com',
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
        ]);
    }
}
