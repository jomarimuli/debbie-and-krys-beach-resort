<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faqs', function (Blueprint $table) {
            $table->id();
            $table->string('question');
            $table->text('answer');
            $table->json('keywords')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('faq_searches', function (Blueprint $table) {
            $table->id();
            $table->string('query');
            $table->foreignId('faq_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('was_helpful')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faq_searches');
        Schema::dropIfExists('faqs');
    }
};
