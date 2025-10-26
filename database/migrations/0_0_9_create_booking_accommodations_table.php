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
        Schema::create('booking_accommodations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accommodation_id')->constrained();
            $table->foreignId('accommodation_rate_id')->constrained()->restrictOnDelete();
            $table->integer('guests')->default(0); // Total guests for this accommodation
            $table->decimal('rate', 10, 2); // Snapshot of rate at booking time
            $table->decimal('additional_pax_charge', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2);
            $table->integer('free_entrance_used')->default(0); // Track free entrances
            $table->timestamps();

            $table->index('booking_id', 'idx_booking_accom_booking_id');
            $table->index('accommodation_id', 'idx_booking_accom_id');
            $table->index('accommodation_rate_id', 'idx_booking_accom_rate_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_accommodations');
    }
};
