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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique(); // BK-202510-0001
            $table->enum('source', ['guest', 'registered', 'walkin']);
            $table->enum('booking_type', ['day_tour', 'overnight']);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            // Guest information
            $table->string('guest_name');
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->string('guest_address')->nullable();

            // Booking details
            $table->date('check_in_date');
            $table->date('check_out_date')->nullable();
            $table->integer('total_adults')->default(0);
            $table->integer('total_children')->default(0);

            // Totals
            $table->decimal('accommodation_total', 10, 2)->default(0);
            $table->decimal('entrance_fee_total', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);

            // Status
            $table->enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['check_in_date', 'check_out_date', 'status'], 'idx_booking_dates_status');
            $table->index('booking_number', 'idx_booking_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
