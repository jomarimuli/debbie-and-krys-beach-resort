<?php

declare(strict_types=1);

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
            $table->string('name'); // e.g., "Big Room", "Small Room", "Big Cottage"
            $table->enum('type', ['room', 'cottage']); // accommodation type
            $table->boolean('is_airconditioned')->default(false); // AC or not
            $table->unsignedInteger('base_capacity'); // max capacity (6, 4, 15, 10)
            $table->text('description')->nullable(); // additional details
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Indexes
            $table->index('type');
            $table->index('status');
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
