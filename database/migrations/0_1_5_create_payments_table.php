<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rebooking_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('payment_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->boolean('is_down_payment')->default(false);
            $table->boolean('is_rebooking_payment')->default(false);
            $table->foreignId('payment_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_number')->nullable();
            $table->string('reference_image')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('payment_date');
            $table->timestamps();

            $table->index('booking_id', 'idx_payment_booking_id');
            $table->index('rebooking_id', 'idx_payment_rebooking_id');
            $table->index('payment_account_id', 'idx_payment_account_id');

            $table->index(['is_rebooking_payment', 'rebooking_id'], 'idx_payment_rebooking_flag');
            $table->index(['is_down_payment', 'booking_id'], 'idx_payment_down_payment');
            $table->index('payment_date', 'idx_payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
