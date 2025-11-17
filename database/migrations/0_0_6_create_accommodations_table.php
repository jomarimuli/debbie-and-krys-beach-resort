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
        Schema::create('accommodations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Big Room (Airconditioned)", "Small Cottage"
            $table->enum('type', ['room', 'cottage']); // Can add more types later
            $table->enum('size', ['small', 'big']); // Can add more sizes later
            $table->text('description')->nullable();
            $table->boolean('is_air_conditioned')->default(false);
            $table->json('images')->nullable();
            $table->integer('min_capacity')->nullable(); // 8 pax
            $table->integer('max_capacity')->nullable(); // 15 pax
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order'], 'idx_accom_active_sort');
            $table->index('type', 'idx_accom_type');
            $table->index('size', 'idx_accom_size');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};
