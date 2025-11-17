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
        Schema::create('booking_entrance_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['adult', 'child']);
            $table->integer('quantity');
            $table->decimal('rate', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->index('booking_id', 'idx_entrance_booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_entrance_fees');
    }
};
