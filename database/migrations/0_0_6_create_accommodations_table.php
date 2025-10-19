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
            $table->text('description')->nullable();
            $table->integer('min_capacity')->nullable(); // 8 pax
            $table->integer('max_capacity')->nullable(); // 15 pax
            $table->integer('quantity_available')->default(1); // How many units exist
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
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
