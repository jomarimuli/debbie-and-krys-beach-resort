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
        Schema::create('cottages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Big Cottage", "Small Cottage"
            $table->enum('size', ['big', 'small']);
            $table->text('description')->nullable();
            $table->integer('max_pax'); // 15 for big, 8 for small
            $table->decimal('day_tour_price', 10, 2); // ₱800 big, ₱400 small
            $table->decimal('overnight_price', 10, 2); // ₱1,000 big, ₱600 small
            $table->integer('quantity');
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
        Schema::dropIfExists('cottages');
    }
};
