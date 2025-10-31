<?php

namespace Database\Seeders;

use App\Models\Taxonomy;
use Illuminate\Database\Seeder;

class ExpertiseTaxonomySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Expertise Categories Taxonomy
        $expertiseCategories = Taxonomy::firstOrCreate(
            ['slug' => 'expertise-categories'],
            [
                'name' => 'Expertise Categories',
                'description' => 'Categories for technical expertise and skills',
            ]
        );

        // Create Expertise Category Terms
        $terms = [
            ['name' => 'Backend', 'slug' => 'backend', 'description' => 'Server-side development', 'order' => 1],
            ['name' => 'Frontend', 'slug' => 'frontend', 'description' => 'Client-side development', 'order' => 2],
            ['name' => 'DevOps', 'slug' => 'devops', 'description' => 'Development and operations', 'order' => 3],
            ['name' => 'Database', 'slug' => 'database', 'description' => 'Database management and design', 'order' => 4],
            ['name' => 'Mobile', 'slug' => 'mobile', 'description' => 'Mobile app development', 'order' => 5],
            ['name' => 'Cloud', 'slug' => 'cloud', 'description' => 'Cloud services and infrastructure', 'order' => 6],
            ['name' => 'Testing', 'slug' => 'testing', 'description' => 'Software testing and QA', 'order' => 7],
            ['name' => 'Security', 'slug' => 'security', 'description' => 'Application and infrastructure security', 'order' => 8],
        ];

        foreach ($terms as $termData) {
            $expertiseCategories->terms()->firstOrCreate(
                ['slug' => $termData['slug']],
                $termData
            );
        }

        $this->command->info('Expertise taxonomy and terms seeded successfully!');
    }
}
