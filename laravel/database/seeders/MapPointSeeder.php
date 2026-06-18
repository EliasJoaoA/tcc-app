<?php

namespace Database\Seeders;

use App\Models\MapPoint;
use App\Models\User;
use Illuminate\Database\Seeder;

class MapPointSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@uepg.br')->first();

        $points = [
            [
                'name' => 'Biblioteca Central',
                'description' => 'Biblioteca central da UEPG com acervo físico e digital. Ambiente silencioso para estudo.',
                'type' => 'quiet_zone',
                'latitude' => -25.09470,
                'longitude' => -50.16180,
                'floor' => 'Térreo',
            ],
            [
                'name' => 'Jardim de Descanso — Bloco B',
                'description' => 'Área verde com bancos para descanso e relaxamento entre as aulas.',
                'type' => 'rest_point',
                'latitude' => -25.09510,
                'longitude' => -50.16220,
                'floor' => null,
            ],
            [
                'name' => 'Bloco de Ciências Exatas',
                'description' => 'Bloco principal dos cursos de Ciência da Computação, Matemática e Física.',
                'type' => 'building',
                'latitude' => -25.09430,
                'longitude' => -50.16150,
                'floor' => null,
            ],
            [
                'name' => 'PROGRAD — Pró-Reitoria de Graduação',
                'description' => 'Serviço de apoio acadêmico, matrículas e documentações.',
                'type' => 'service',
                'latitude' => -25.09380,
                'longitude' => -50.16090,
                'floor' => 'Térreo',
            ],
            [
                'name' => 'Sala de Apoio ao Estudante',
                'description' => 'Sala tranquila de apoio psicológico e pedagógico ao estudante com necessidades especiais.',
                'type' => 'quiet_zone',
                'latitude' => -25.09550,
                'longitude' => -50.16260,
                'floor' => '1º Andar',
            ],
        ];

        foreach ($points as $point) {
            MapPoint::create(array_merge($point, ['created_by' => $admin->id]));
        }
    }
}
