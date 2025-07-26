<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Permission>
 */
class PermissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'resource' => fake()->domainWord,
            'actions' => ['viewAny', 'view', 'create', 'update', 'delete', 'restore', 'forceDelete'],
        ];
    }
}
