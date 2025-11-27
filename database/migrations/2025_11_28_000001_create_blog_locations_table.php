<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_id')->constrained()->cascadeOnDelete();

            // Location coordinates
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 11, 7);

            // Location details
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('address')->nullable();

            // Ordering for itinerary
            $table->integer('order')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['blog_id', 'order']);
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_locations');
    }
};
