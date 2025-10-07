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
        Schema::create('crypto_portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('coin_id'); // CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
            $table->string('symbol'); // BTC, ETH, etc.
            $table->string('name'); // Bitcoin, Ethereum, etc.
            $table->decimal('holdings', 20, 8); // Amount of crypto owned (8 decimals for precision)
            $table->decimal('purchase_price', 20, 8)->nullable(); // Price at purchase
            $table->decimal('total_invested', 20, 2)->nullable(); // Total amount invested in USD
            $table->timestamp('purchase_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Ensure user can't have duplicate entries for same coin
            $table->unique(['user_id', 'coin_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crypto_portfolios');
    }
};
