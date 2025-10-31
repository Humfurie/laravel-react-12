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
        Schema::create('taxonomables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('taxonomy_term_id')->constrained()->cascadeOnDelete();
            $table->morphs('taxonomable'); // Creates taxonomable_id and taxonomable_type
            $table->timestamps();

            $table->unique(['taxonomy_term_id', 'taxonomable_id', 'taxonomable_type'], 'taxonomable_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taxonomables');
    }
};
