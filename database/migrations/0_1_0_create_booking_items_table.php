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
        Schema::create('booking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();

            $table->morphs('bookable');

            $table->string('item_name');
            $table->string('item_type'); // room, cottage

            $table->enum('rental_type', ['day_tour', 'overnight']);

            $table->integer('quantity')->default(1);
            $table->integer('pax')->default(0);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);

            // For rooms only
            $table->integer('free_entrance_count')->default(0);
            $table->string('free_cottage_size')->nullable(); // 'big', 'small'

            // Extra charges
            $table->integer('extra_pax')->default(0);

            $table->decimal('excess_pax_fee', 10, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_items');
    }
};
