<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('images', function (Blueprint $table) {
            // Image metadata
            $table->string('filename')->nullable()->after('path');
            $table->string('mime_type')->nullable()->after('filename');
            $table->unsignedBigInteger('size')->nullable()->after('mime_type'); // in bytes

            // Image ordering and primary selection
            $table->integer('order')->default(0)->after('size')->index();
            $table->boolean('is_primary')->default(false)->after('order')->index();

            // Thumbnail sizes (JSON array of generated sizes)
            // Structure: {"small": "path/to/small.jpg", "medium": "...", "large": "..."}
            $table->json('sizes')->nullable()->after('is_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropColumn([
                'filename',
                'mime_type',
                'size',
                'order',
                'is_primary',
                'sizes',
            ]);
        });
    }
};
