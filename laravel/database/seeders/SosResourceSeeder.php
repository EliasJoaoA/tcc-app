<?php

namespace Database\Seeders;

use App\Models\MapPoint;
use App\Models\SosResource;
use Illuminate\Database\Seeder;

class SosResourceSeeder extends Seeder
{
    public function run(): void
    {
        $calmPoint = MapPoint::where('type', 'quiet_zone')->first();

        SosResource::create([
            'type' => 'breathing',
            'title' => 'Respiração 4-4-4',
            'description' => 'Técnica de respiração box para reduzir ansiedade em momentos de estresse.',
            'content' => [
                'steps' => [
                    ['label' => 'Inspire', 'duration' => 4],
                    ['label' => 'Segure', 'duration' => 4],
                    ['label' => 'Expire', 'duration' => 4],
                ],
                'cycles' => 4,
            ],
            'is_active' => true,
        ]);

        SosResource::create([
            'type' => 'calm_route',
            'title' => 'Rota para Zona Tranquila',
            'description' => 'Navegue até o local mais próximo e tranquilo do campus.',
            'map_point_id' => $calmPoint?->id,
            'is_active' => true,
        ]);

        SosResource::create([
            'type' => 'service',
            'title' => 'Apoio Psicológico — UEPG',
            'description' => 'Serviço de acompanhamento psicológico gratuito para estudantes da UEPG. Agende sua consulta pela PROGRAD.',
            'content' => [
                'phone' => '(42) 3220-3000',
                'email' => 'apoio@uepg.br',
                'hours' => 'Segunda a Sexta, 08h–17h',
            ],
            'is_active' => true,
        ]);
    }
}
