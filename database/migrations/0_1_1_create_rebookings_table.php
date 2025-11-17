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
        Schema::create('rebookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('original_booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->string('rebooking_number')->unique(); // RB-202510-0001
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();

            // New booking details
            $table->date('new_check_in_date');
            $table->date('new_check_out_date')->nullable();
            $table->integer('new_total_adults')->default(0);
            $table->integer('new_total_children')->default(0);

            // Financial tracking
            $table->decimal('original_amount', 10, 2)->default(0);
            $table->decimal('new_amount', 10, 2)->default(0);
            $table->decimal('amount_difference', 10, 2)->default(0); // positive = additional payment, negative = refund
            $table->decimal('rebooking_fee', 10, 2)->default(0);
            $table->decimal('total_adjustment', 10, 2)->default(0); // amount_difference + rebooking_fee

            // Status tracking
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');

            // Reason and notes
            $table->text('reason')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('original_booking_id', 'idx_rebooking_original');
            $table->index('rebooking_number', 'idx_rebooking_number');
            $table->index(['status', 'created_at'], 'idx_rebooking_status_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rebookings');
    }
};
