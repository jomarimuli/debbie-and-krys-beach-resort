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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('payment_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'card', 'bank', 'gcash', 'maya', 'other']);

            $table->boolean('is_down_payment')->default(false);

            $table->foreignId('payment_account_id')->nullable()->constrained()->nullOnDelete();

            $table->string('reference_number')->nullable();
            $table->string('reference_image')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('payment_date');
            $table->timestamps();

            $table->index('booking_id', 'idx_payment_booking_id');
            $table->index('payment_account_id', 'idx_payment_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
