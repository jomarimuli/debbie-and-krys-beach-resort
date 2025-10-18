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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_number')->unique();

            $table->enum('booking_type', ['registered', 'guest', 'walk_in'])->default('registered');

            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->text('guest_address')->nullable();

            $table->date('check_in_date');
            $table->date('check_out_date')->nullable();

            $table->enum('rental_type', ['overnight', 'day_tour'])->default('day_tour');

            $table->integer('total_pax');

            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('entrance_fee_total', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->decimal('balance', 10, 2)->default(0);

            $table->enum('status', ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])
                ->default('pending');

            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])
                ->default('unpaid');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->text('notes')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('booking_number');
            $table->index('booking_type');
            $table->index('rental_type');
            $table->index('check_in_date');
            $table->index('status');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
