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
        Schema::table('financing_options', function (Blueprint $table) {
            // Rename columns to match model
            $table->renameColumn('term_years', 'loan_term_years');
            $table->renameColumn('estimated_monthly_amortization', 'monthly_amortization');
            $table->renameColumn('is_estimate', 'is_active');

            // Add missing columns
            $table->string('bank_name', 100)->after('property_pricing_id')->index();
            $table->decimal('loan_to_value_ratio', 5, 2)->after('bank_name')->nullable();
            $table->decimal('processing_fee', 15, 2)->after('monthly_amortization')->nullable();
            $table->json('requirements')->after('processing_fee')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financing_options', function (Blueprint $table) {
            // Remove added columns
            $table->dropColumn(['bank_name', 'loan_to_value_ratio', 'processing_fee', 'requirements']);

            // Rename columns back
            $table->renameColumn('loan_term_years', 'term_years');
            $table->renameColumn('monthly_amortization', 'estimated_monthly_amortization');
            $table->renameColumn('is_active', 'is_estimate');
        });
    }
};
