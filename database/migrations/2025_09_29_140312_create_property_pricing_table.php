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
        Schema::create('property_pricing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');

            // Basic Pricing
            $table->decimal('reservation_fee', 15, 2)->nullable();
            $table->decimal('total_contract_price', 15, 2);
            $table->decimal('net_selling_price', 15, 2)->nullable(); // TCP minus reservation
            $table->string('currency', 10)->default('PHP');

            // Downpayment Details
            $table->decimal('downpayment_percentage', 5, 2)->nullable(); // e.g., 15.00
            $table->decimal('downpayment_amount', 15, 2)->nullable();

            // Equity Payment (Monthly installment before bank financing)
            $table->integer('equity_terms_months')->nullable(); // e.g., 35 months
            $table->decimal('monthly_equity', 15, 2)->nullable();

            // Balloon Payment
            $table->decimal('balloon_payment', 15, 2)->nullable();
            $table->integer('balloon_payment_month')->nullable(); // e.g., 36th month

            // Bank Financing
            $table->decimal('bank_financing_amount', 15, 2)->nullable();
            $table->decimal('bank_financing_percentage', 5, 2)->nullable();

            // Fees
            $table->boolean('miscellaneous_fees_included')->default(false);
            $table->decimal('transfer_fee_percentage', 5, 2)->nullable(); // e.g., 5.00
            $table->decimal('move_in_fee_percentage', 5, 2)->nullable(); // e.g., 1.50

            // Association/Maintenance
            $table->decimal('association_dues_monthly', 10, 2)->nullable();

            // Parking (if sold separately)
            $table->decimal('parking_slot_price', 15, 2)->nullable();

            // Payment Scheme Description
            $table->string('payment_scheme_name', 100)->nullable(); // e.g., 'OPTION 2: DP Equally paid for 36 months'
            $table->text('payment_notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['total_contract_price']);
            $table->index(['downpayment_amount']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('property_pricing');
    }
};
