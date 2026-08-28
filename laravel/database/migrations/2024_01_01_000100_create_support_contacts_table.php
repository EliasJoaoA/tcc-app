<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('relationship')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // Migra o contato de apoio único já existente para a nova tabela,
        // marcando-o como principal.
        $legacy = DB::table('users')
            ->whereNotNull('support_contact_phone')
            ->where('support_contact_phone', '!=', '')
            ->get();

        foreach ($legacy as $user) {
            DB::table('support_contacts')->insert([
                'user_id' => $user->id,
                'name' => $user->support_contact_name ?: 'Contato de apoio',
                'phone' => $user->support_contact_phone,
                'relationship' => null,
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('support_contacts');
    }
};
