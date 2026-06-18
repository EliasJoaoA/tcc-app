<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrador UEPG',
            'email' => 'admin@uepg.br',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'course' => null,
        ]);

        UserPreference::create(['user_id' => $admin->id]);

        $student = User::create([
            'name' => 'Estudante UEPG',
            'email' => 'estudante@uepg.br',
            'password' => Hash::make('password'),
            'role' => 'student',
            'course' => 'Ciência da Computação',
            'support_contact_name' => 'Maria Silva',
            'support_contact_phone' => '(42) 99999-0000',
        ]);

        UserPreference::create(['user_id' => $student->id]);
    }
}
