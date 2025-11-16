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
        Schema::create('rebooking_accommodations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rebooking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('accommodation_id')->constrained();
            $table->foreignId('accommodation_rate_id')->constrained()->restrictOnDelete();
            $table->integer('guests')->default(0);
            $table->decimal('rate', 10, 2);
            $table->decimal('additional_pax_charge', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2);
            $table->integer('free_entrance_used')->default(0);
            $table->timestamps();

            $table->index('rebooking_id', 'idx_rebooking_accom_rebooking');
            $table->index('accommodation_id', 'idx_rebooking_accom_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rebooking_accommodations');
    }
};
