<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('font_size', ['small', 'medium', 'large'])->default('medium');
            $table->boolean('high_contrast')->default(false);
            $table->string('calm_color_scheme', 50)->nullable();
            $table->boolean('auto_captions')->default(false);
            $table->boolean('reduce_animations')->default(false);
            $table->boolean('notifications_enabled')->default(true);
            $table->integer('notifications_deadline_hours')->default(24);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
