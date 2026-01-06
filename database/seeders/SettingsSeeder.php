<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Branding Settings
            [
                'key' => 'site_logo',
                'value' => 'logo.png',
                'type' => 'file',
                'description' => 'Main logo displayed in the header and sidebar',
                'group' => 'branding',
            ],
            [
                'key' => 'site_name',
                'value' => 'Humfurie',
                'type' => 'string',
                'description' => 'Website name',
                'group' => 'branding',
            ],
            [
                'key' => 'site_title',
                'value' => 'Humfurie - Software Developer',
                'type' => 'string',
                'description' => 'Default page title',
                'group' => 'branding',
            ],
            [
                'key' => 'site_description',
                'value' => 'Professional software developer portfolio',
                'type' => 'string',
                'description' => 'Site meta description',
                'group' => 'branding',
            ],

            // Files Settings
            [
                'key' => 'resume_file',
                'value' => null,
                'type' => 'file',
                'description' => 'Resume PDF file for download',
                'group' => 'files',
            ],
            [
                'key' => 'cv_file',
                'value' => null,
                'type' => 'file',
                'description' => 'CV/Portfolio document',
                'group' => 'files',
            ],

            // Social Links
            [
                'key' => 'social_links',
                'value' => json_encode([
                    'github' => 'https://github.com/humfurie',
                    'linkedin' => 'https://linkedin.com/in/humfurie',
                    'twitter' => 'https://twitter.com/humfurie',
                    'email' => 'humfurie@gmail.com',
                ]),
                'type' => 'json',
                'description' => 'Social media links',
                'group' => 'social',
            ],

            // Contact Settings
            [
                'key' => 'contact_email',
                'value' => 'humfurie@gmail.com',
                'type' => 'string',
                'description' => 'Primary contact email',
                'group' => 'contact',
            ],
            [
                'key' => 'contact_phone',
                'value' => '+63 9397535416',
                'type' => 'string',
                'description' => 'Contact phone number',
                'group' => 'contact',
            ],

            // General Settings
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Enable/disable maintenance mode',
                'group' => 'general',
            ],
            [
                'key' => 'items_per_page',
                'value' => '10',
                'type' => 'integer',
                'description' => 'Default items per page for pagination',
                'group' => 'general',
            ],

            // Footer Links
            [
                'key' => 'footer_links',
                'value' => json_encode([
                    ['label' => 'Home', 'url' => '/'],
                    ['label' => 'Blog', 'url' => '/blog'],
                    ['label' => 'Properties', 'url' => '/properties'],
                ]),
                'type' => 'json',
                'description' => 'Footer navigation links',
                'group' => 'footer',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
