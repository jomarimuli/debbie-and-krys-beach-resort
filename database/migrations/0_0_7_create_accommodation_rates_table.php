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
            $table->decimal('rate', 10, 2); // ₱4,500, ₱800, ₱1,000
            $table->integer('base_capacity')->nullable(); // 6 pax, 4 pax (for rooms)
            $table->decimal('additional_pax_rate', 10, 2)->nullable(); // ₱150 per head
            $table->decimal('entrance_fee', 10, 2)->nullable(); // ₱100, ₱150 per head
            $table->decimal('child_entrance_fee', 10, 2)->nullable(); // ₱50
            $table->integer('child_max_age')->nullable(); // 5 years old
            $table->boolean('includes_free_cottage')->default(false);
            $table->boolean('includes_free_entrance')->default(false);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['accommodation_id', 'booking_type']);
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
