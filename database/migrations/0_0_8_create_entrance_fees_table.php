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
        Schema::create('entrance_fees', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Adult", "Child (5 & below)", etc
            $table->enum('rental_type', ['day_tour', 'overnight']); // important!
            $table->decimal('price', 10, 2); // day: 100/50, overnight: 150
            $table->integer('min_age')->nullable(); // 0 for child
            $table->integer('max_age')->nullable(); // 5 for child
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
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
