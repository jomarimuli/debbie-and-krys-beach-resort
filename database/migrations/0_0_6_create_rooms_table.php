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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Big Room", "Small Room"
            $table->enum('size', ['big', 'small']);
            $table->text('description')->nullable();
            $table->integer('max_pax');
            $table->decimal('day_tour_price', 10, 2);
            $table->decimal('overnight_price', 10, 2)->nullable(); // for future if you add overnight rooms
            $table->integer('quantity');
            $table->boolean('has_ac')->default(true); // your rooms are all AC

            // Inclusions
            $table->integer('free_entrance_count'); // 6 for big, 4 for small
            $table->string('free_cottage_size')->nullable(); // 'small' - both get 1 small cottage
            $table->decimal('excess_pax_fee', 10, 2); // ₱150 for both

            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
