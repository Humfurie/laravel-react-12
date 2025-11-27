<?php

namespace Database\Seeders;

use App\Models\Expertise;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

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

        foreach ($expertises as $expertiseData) {
            // All environments now use MinIO
            $localImagePath = public_path($expertiseData['image']);

            if (File::exists($localImagePath)) {
                $filename = basename($expertiseData['image']);
                $minioPath = 'images/techstack/' . $filename;

                // Check if already uploaded to MinIO
                if (!Storage::disk('minio')->exists($minioPath)) {
                    // Upload to MinIO
                    $imageContent = File::get($localImagePath);
                    Storage::disk('minio')->put($minioPath, $imageContent);
                    $this->command->info("Uploaded {$filename} to MinIO");
                } else {
                    $this->command->info("Image already exists in MinIO: {$filename}");
                }

                // Store MinIO URL
                // This will automatically use the correct URL based on MINIO_URL env var:
                // - Local/Testing: http://localhost:9200
                // - Production: https://cdn.humfurie.org
                $expertiseData['image'] = Storage::disk('minio')->url($minioPath);
            } else {
                if (!str_starts_with($expertiseData['image'], 'http')) {
                    $this->command->warn("Image not found: {$expertiseData['image']}");
                }
            }

            Expertise::updateOrCreate(
                ['name' => $expertiseData['name']], // Find by name
                $expertiseData // Update or create with these values
            );
        }

        $this->command->info('Expertises seeded successfully!');
    }
}
