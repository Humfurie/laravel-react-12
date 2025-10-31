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
        Schema::create('taxonomy_models', function (Blueprint $table) {
            $table->id();
            $table->foreignId('taxonomy_id')->constrained()->onDelete('cascade');
            $table->string('model_class'); // e.g., 'App\Models\Blog', 'App\Models\Expertise'
            $table->timestamps();

            // Ensure a taxonomy can't be bound to the same model class twice
            $table->unique(['taxonomy_id', 'model_class']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taxonomy_models');
    }
};
