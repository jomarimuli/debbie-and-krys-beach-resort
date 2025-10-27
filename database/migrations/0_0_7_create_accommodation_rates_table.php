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
        Schema::create('accommodation_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->constrained()->cascadeOnDelete();
            $table->enum('booking_type', ['day_tour', 'overnight']);
            $table->decimal('rate', 10, 2);
            $table->decimal('additional_pax_rate', 10, 2)->nullable();
            $table->decimal('adult_entrance_fee', 10, 2)->nullable();
            $table->decimal('child_entrance_fee', 10, 2)->nullable();
            $table->integer('child_max_age')->nullable();
            $table->boolean('includes_free_cottage')->default(false);
            $table->boolean('includes_free_entrance')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['accommodation_id', 'booking_type']);

            $table->index('accommodation_id', 'idx_rates_accom_id');
            $table->index('booking_type', 'idx_rates_booking_type');
            $table->index('is_active', 'idx_rates_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodation_rates');
    }
};
