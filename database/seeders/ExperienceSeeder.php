<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Database\Seeder;

class ExperienceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Try to get the user by email, fallback to first user
        $user = User::where('email', 'humfurie@gmail.com')->first()
            ?? User::first();

        if (!$user) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        $this->command->info("Seeding experiences for user: {$user->email}");

        $experiences = [
            [
                'position' => 'Software Engineer',
                'company' => 'Cody Web Development Inc',
                'location' => 'Cebu City, Philippines',
                'image' => 'cody.png',
                'description' => [
                    'Converting legacy PHP applications using Ethna and Smarty templates to modern Laravel 11.',
                    'Refactoring outdated logic into modern Laravel features such as route model binding, invokable controllers, and service-based architecture.',
                    'Collaborating with team to ensure smooth transition and accurate system behavior replication.',
                ],
                'start_month' => 6, // July (0-indexed)
                'start_year' => 2024,
                'end_month' => null,
                'end_year' => null,
                'is_current_position' => true,
                'display_order' => 1,
            ],
            [
                'position' => 'Junior Laravel Developer | Junior Software Developer',
                'company' => 'Halcyon Digital Media Design | Halcyon Agile',
                'location' => 'Cordova, Cebu, Philippines',
                'image' => 'halcyon.png',
                'description' => [
                    'Worked on Laravel maintenance projects, upgrading outdated syntax and optimizing inefficient code.',
                    'Assisted in integrating Laravel Filament for backend admin dashboards.',
                    'Participated in debugging and feature improvements for legacy and active projects.',
                    'Collaborated with various teams to troubleshoot and resolve issues.',
                ],
                'start_month' => 6, // July
                'start_year' => 2023,
                'end_month' => 0, // January
                'end_year' => 2024,
                'is_current_position' => false,
                'display_order' => 2,
            ],
            [
                'position' => 'Junior Laravel Trainee',
                'company' => 'Halcyon Digital Media Design | Halcyon Agile',
                'location' => 'Cordova, Cebu, Philippines',
                'image' => 'halcyon.png',
                'description' => [
                    'Acquiring experience and familiarity with best development practices.',
                    'Trained in Laravel, PHP and Filament.',
                    'Introduced to Domain-Driven Design principles.',
                    'Skills gained from training include PHP, Laravel, Filament, and JQuery.',
                ],
                'start_month' => 3, // April
                'start_year' => 2023,
                'end_month' => 6, // July
                'end_year' => 2023,
                'is_current_position' => false,
                'display_order' => 3,
            ],
            [
                'position' => 'Intern',
                'company' => 'Halcyon Digital Media Design | Halcyon Agile',
                'location' => 'Cordova, Cebu, Philippines',
                'image' => 'halcyon.png',
                'description' => [
                    "I've been introduced to technologies such as React, NodeJS, JavaScript, Tailwind, as well as various frameworks and tools like Git, among others.",
                    "I have experience working with the AdonisJS Framework and Next.js, and I've completed several minor projects using them.",
                    "I've developed APIs and successfully completed our capstone project, which is an Automated Attendance System utilizing RFID Technology.",
                ],
                'start_month' => 8, // September
                'start_year' => 2022,
                'end_month' => 1, // February
                'end_year' => 2023,
                'is_current_position' => false,
                'display_order' => 4,
            ],
        ];

        foreach ($experiences as $experienceData) {
            $imageName = $experienceData['image'];
            unset($experienceData['image']);

            // Create the experience
            $experience = Experience::create([
                'user_id' => $user->id,
                ...$experienceData,
            ]);

            // Determine which disk to use based on configuration
            $disk = config('filesystems.default');
            $storagePath = 'experiences/' . $imageName;
            $localImagePath = storage_path('app/public/experiences/' . $imageName);

            // Handle file upload based on disk type
            if ($disk === 'minio') {
                // Production: Upload to MinIO
                if (\Illuminate\Support\Facades\File::exists($localImagePath)) {
                    if (!\Illuminate\Support\Facades\Storage::disk('minio')->exists($storagePath)) {
                        $imageContent = \Illuminate\Support\Facades\File::get($localImagePath);
                        \Illuminate\Support\Facades\Storage::disk('minio')->put($storagePath, $imageContent);
                        $this->command->info("Uploaded {$imageName} to MinIO");
                    } else {
                        $this->command->info("Image already exists in MinIO: {$imageName}");
                    }
                } else {
                    $this->command->warn("Local image not found: {$localImagePath}");
                }
            } else {
                // Local: Use public disk
                if (\Illuminate\Support\Facades\File::exists($localImagePath)) {
                    $this->command->info("Using local public disk for {$imageName}");
                } else {
                    $this->command->warn("Local image not found: {$localImagePath}");
                }
            }

            // Create the associated image using polymorphic relationship
            $experience->image()->create([
                'name' => $imageName,
                'path' => $storagePath,
            ]);

            $this->command->info("Created experience: {$experience->position} at {$experience->company}");
        }

        $this->command->info('Experience seeding completed successfully!');
    }
}
