<?php

namespace Database\Seeders;

use App\Models\Taxonomy;
use Illuminate\Database\Seeder;

class TaxonomySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Blog Categories Taxonomy
        $blogCategories = Taxonomy::create([
            'name' => 'Blog Categories',
            'slug' => 'blog-categories',
            'description' => 'Categories for blog posts',
        ]);

        // Create Blog Category Terms
        $blogCategories->terms()->createMany([
            ['name' => 'Political', 'slug' => 'political', 'description' => 'Political articles and opinions', 'order' => 1],
            ['name' => 'Technology', 'slug' => 'technology', 'description' => 'Tech news and tutorials', 'order' => 2],
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Business insights and strategies', 'order' => 3],
            ['name' => 'Lifestyle', 'slug' => 'lifestyle', 'description' => 'Lifestyle and personal development', 'order' => 4],
            ['name' => 'Travel', 'slug' => 'travel', 'description' => 'Travel guides and experiences', 'order' => 5],
        ]);

        // Create Blog Tags Taxonomy
        $blogTags = Taxonomy::create([
            'name' => 'Blog Tags',
            'slug' => 'blog-tags',
            'description' => 'Tags for blog posts',
        ]);

        // Create Blog Tag Terms
        $blogTags->terms()->createMany([
            ['name' => 'Laravel', 'slug' => 'laravel', 'order' => 1],
            ['name' => 'React', 'slug' => 'react', 'order' => 2],
            ['name' => 'PHP', 'slug' => 'php', 'order' => 3],
            ['name' => 'JavaScript', 'slug' => 'javascript', 'order' => 4],
            ['name' => 'Web Development', 'slug' => 'web-development', 'order' => 5],
            ['name' => 'Tutorial', 'slug' => 'tutorial', 'order' => 6],
        ]);

        $this->command->info('Taxonomies and terms seeded successfully!');
    }
}
