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
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('refund_number')->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('refund_method', ['cash', 'card', 'bank', 'gcash', 'maya', 'original_method', 'other']);

            $table->foreignId('refund_account_id')->nullable()->constrained('payment_accounts')->nullOnDelete();

            $table->string('reference_number')->nullable();
            $table->string('reference_image')->nullable();
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('refund_date');
            $table->timestamps();

            $table->index('payment_id', 'idx_refund_payment_id');
            $table->index('refund_account_id', 'idx_refund_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
