<?php

namespace Database\Seeders;

use App\Models\Expertise;
use Illuminate\Database\Seeder;

class ExpertiseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $expertises = [
            [
                'name' => 'Laravel',
                'image' => 'images/techstack/laravel.webp',
                'category_slug' => 'be',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Docker',
                'image' => 'images/techstack/docker.webp',
                'category_slug' => 'td',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Ngnix',
                'image' => 'images/techstack/ngnix.webp',
                'category_slug' => 'td',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'API',
                'image' => 'images/techstack/api.webp',
                'category_slug' => 'td',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'React JS',
                'image' => 'images/techstack/react.webp',
                'category_slug' => 'fe',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Tailwind CSS',
                'image' => 'images/techstack/tailwind-css.webp',
                'category_slug' => 'fe',
                'order' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Next.js',
                'image' => 'images/techstack/next-js.webp',
                'category_slug' => 'fe',
                'order' => 7,
                'is_active' => true,
            ],
            [
                'name' => 'GitHub',
                'image' => 'images/techstack/github.webp',
                'category_slug' => 'td',
                'order' => 8,
                'is_active' => true,
            ],
            [
                'name' => 'Postman',
                'image' => 'images/techstack/postman.webp',
                'category_slug' => 'td',
                'order' => 9,
                'is_active' => true,
            ],
            [
                'name' => 'Xampp',
                'image' => 'images/techstack/xampp.webp',
                'category_slug' => 'td',
                'order' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Git',
                'image' => 'images/techstack/git.webp',
                'category_slug' => 'td',
                'order' => 11,
                'is_active' => true,
            ],
            [
                'name' => 'Adonis JS',
                'image' => 'images/techstack/adonis.webp',
                'category_slug' => 'be',
                'order' => 12,
                'is_active' => true,
            ],
            [
                'name' => 'PHP',
                'image' => 'images/techstack/php.webp',
                'category_slug' => 'be',
                'order' => 13,
                'is_active' => true,
            ],
            [
                'name' => 'Filament',
                'image' => 'images/techstack/filament.webp',
                'category_slug' => 'be',
                'order' => 14,
                'is_active' => true,
            ],
            [
                'name' => 'MySQL',
                'image' => 'images/techstack/mysql.webp',
                'category_slug' => 'td',
                'order' => 15,
                'is_active' => true,
            ],
            [
                'name' => 'JavaScript',
                'image' => 'images/techstack/javascript.webp',
                'category_slug' => 'fe',
                'order' => 16,
                'is_active' => true,
            ],
            [
                'name' => 'HTML',
                'image' => 'images/techstack/html.webp',
                'category_slug' => 'fe',
                'order' => 17,
                'is_active' => true,
            ],
        ];

        foreach ($expertises as $expertise) {
            Expertise::updateOrCreate(
                ['name' => $expertise['name']], // Find by name
                $expertise // Update or create with these values
            );
        }

        $this->command->info('Expertises seeded successfully!');
    }
}
