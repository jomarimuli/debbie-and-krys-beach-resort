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
        Schema::create('entrance_fee_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();

            $table->foreignId('entrance_fee_id')->nullable()->constrained()->nullOnDelete();

            $table->string('fee_name'); // "Adult (Day Tour)", "Child (Day Tour)", etc

            $table->enum('rental_type', ['day_tour', 'overnight']);

            $table->integer('age_min')->nullable();
            $table->integer('age_max')->nullable();

            $table->integer('pax_count');
            $table->decimal('rate', 10, 2);
            $table->decimal('total', 10, 2);

            $table->integer('free_count')->default(0);
            $table->integer('paid_count');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrance_fee_details');
    }
};
