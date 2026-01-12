<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * Creates the videos table to store uploaded video files and their metadata.
     * Similar to the existing Image model pattern but specifically for video content.
     */
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();

            // Display name for the video
            $table->string('name');

            // Storage path to the video file
            $table->string('path');

            // Original filename
            $table->string('filename');

            // MIME type (video/mp4, video/quicktime, etc.)
            $table->string('mime_type');

            // File size in bytes
            $table->bigInteger('size');

            // Video duration in seconds
            $table->integer('duration')->nullable();

            // Video width in pixels
            $table->integer('width')->nullable();

            // Video height in pixels
            $table->integer('height')->nullable();

            // Polymorphic relationship to parent model (typically SocialPost)
            $table->string('videoable_type')->index();
            $table->unsignedBigInteger('videoable_id')->index();

            // Processing status: pending, processing, completed, failed
            $table->enum('processing_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');

            // Path to auto-generated thumbnail
            $table->string('thumbnail_path')->nullable();

            // Video metadata as JSON (codec, bitrate, framerate, etc.)
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Composite index for polymorphic relationship
            $table->index(['videoable_type', 'videoable_id']);
            $table->index('processing_status'); // Filter by processing status
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
