<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sos_resources', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['breathing', 'calm_route', 'service']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('map_point_id')->nullable()->constrained('map_points')->nullOnDelete();
            $table->json('content')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sos_resources');
    }
};
