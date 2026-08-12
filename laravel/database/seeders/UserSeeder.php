<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminPassword = env('SEED_ADMIN_PASSWORD');
        $studentPassword = env('SEED_STUDENT_PASSWORD');

        if (app()->environment('production') && (! $adminPassword || ! $studentPassword)) {
            throw new RuntimeException(
                'Defina SEED_ADMIN_PASSWORD e SEED_STUDENT_PASSWORD antes de executar o seeder em produção.'
            );
        }

        $admin = User::updateOrCreate([
            'email' => 'admin@uepg.br',
        ], [
            'name' => 'Administrador UEPG',
            'password' => Hash::make($adminPassword ?: 'password'),
            'role' => 'admin',
            'course' => null,
        ]);

        UserPreference::firstOrCreate(['user_id' => $admin->id]);

        $student = User::updateOrCreate([
            'email' => 'estudante@uepg.br',
        ], [
            'name' => 'Estudante UEPG',
            'password' => Hash::make($studentPassword ?: 'password'),
            'role' => 'student',
            'course' => 'Ciência da Computação',
            'support_contact_name' => 'Maria Silva',
            'support_contact_phone' => '(42) 99999-0000',
        ]);

        UserPreference::firstOrCreate(['user_id' => $student->id]);
    }
}
