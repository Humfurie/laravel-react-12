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
        Schema::table('inquiries', function (Blueprint $table) {
            // Rename client_* columns to customer_*
            $table->renameColumn('client_name', 'customer_name');
            $table->renameColumn('client_email', 'customer_email');
            $table->renameColumn('client_phone', 'customer_phone');

            // Add missing columns
            $table->string('inquiry_type', 50)->after('customer_phone')->nullable()->index();
            $table->string('preferred_contact_time', 100)->after('message')->nullable();
            $table->text('agent_notes')->after('status')->nullable();
            $table->timestamp('followed_up_at')->after('agent_notes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            // Remove added columns
            $table->dropColumn(['inquiry_type', 'preferred_contact_time', 'agent_notes', 'followed_up_at']);

            // Rename customer_* columns back to client_*
            $table->renameColumn('customer_name', 'client_name');
            $table->renameColumn('customer_email', 'client_email');
            $table->renameColumn('customer_phone', 'client_phone');
        });
    }
};
