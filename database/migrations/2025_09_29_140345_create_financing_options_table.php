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
        Schema::create('financing_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_pricing_id')->constrained('property_pricing')->onDelete('cascade');

            $table->integer('term_years'); // 10, 15, 20 years
            $table->decimal('estimated_monthly_amortization', 15, 2)->nullable();
            $table->decimal('interest_rate', 5, 2)->nullable(); // Optional: if you want to show rates

            $table->boolean('is_estimate')->default(true); // Mark if this is an estimate
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['term_years']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financing_options');
    }
};
