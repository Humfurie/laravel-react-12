<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('content'); // Rich content from Tiptap
            $table->text('excerpt')->nullable(); // Short description
            $table->string('status')->default('draft'); // draft, published, private
            $table->string('featured_image')->nullable(); // Path to featured image
            $table->json('meta_data')->nullable(); // SEO and other metadata
            $table->json('tags')->nullable(); // Tags for the blog post
            $table->boolean('isPrimary')->default(false);
            $table->integer('sort_order')->default(0);
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['status', 'published_at']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
