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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');

            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone', 50)->nullable();
            $table->text('message')->nullable();

            $table->string('status', 50)->default('new')->index(); // 'new', 'contacted', 'viewing_scheduled', 'closed'

            $table->timestamps();

            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['client_email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
