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
        Schema::create('accommodation_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('accommodation_id')->constrained('accommodations')->cascadeOnDelete();
            $table->foreignId('tour_type_id')->constrained('tour_types')->cascadeOnDelete();
            $table->decimal('base_rate', 10, 2); // ₱4,500, ₱3,500, ₱800, etc.
            $table->unsignedInteger('included_guests'); // number of guests included in base rate
            $table->decimal('additional_guest_rate', 10, 2)->nullable(); // ₱150 per additional head
            $table->foreignId('free_cottage_id')->nullable()->constrained('accommodations')->nullOnDelete(); // for rooms with free cottage
            $table->unsignedInteger('free_entrance_count')->default(0); // number of free entrances included
            $table->text('notes')->nullable(); // any special notes or conditions
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Indexes
            $table->index(['accommodation_id', 'tour_type_id']);
            $table->index('status');

            // Ensure unique combination of accommodation and tour type
            $table->unique(['accommodation_id', 'tour_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodation_rates');
    }
};
