<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_auto_replies', function (Blueprint $table) {
            $table->id();
            $table->string('trigger_type')->default('new_conversation');
            $table->text('message');
            $table->boolean('is_active')->default(true);
            $table->integer('delay_seconds')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_auto_replies');
    }
};
