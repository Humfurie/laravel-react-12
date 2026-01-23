<?php

namespace Database\Seeders;

use App\Models\ProjectCategory;
use Illuminate\Database\Seeder;

class ProjectCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['slug' => 'web_app', 'name' => 'Web Application', 'sort_order' => 1],
            ['slug' => 'mobile_app', 'name' => 'Mobile App', 'sort_order' => 2],
            ['slug' => 'api', 'name' => 'API / Backend', 'sort_order' => 3],
            ['slug' => 'library', 'name' => 'Library / Package', 'sort_order' => 4],
            ['slug' => 'cli', 'name' => 'CLI Tool', 'sort_order' => 5],
            ['slug' => 'design', 'name' => 'Design System', 'sort_order' => 6],
        ];

        foreach ($categories as $category) {
            ProjectCategory::firstOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'sort_order' => $category['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
