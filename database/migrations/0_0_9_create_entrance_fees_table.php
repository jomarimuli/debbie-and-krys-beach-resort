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
        Schema::create('entrance_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_type_id')->constrained('tour_types')->cascadeOnDelete();
            $table->string('age_category'); // e.g., "regular", "child", "senior"
            $table->unsignedInteger('min_age')->nullable(); // minimum age (e.g., 6 for regular)
            $table->unsignedInteger('max_age')->nullable(); // maximum age (e.g., 5 for child)
            $table->decimal('fee', 10, 2); // ₱100, ₱50, ₱150
            $table->text('description')->nullable(); // e.g., "5 years old & below"
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Indexes
            $table->index(['tour_type_id', 'age_category']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrance_fees');
    }
};
