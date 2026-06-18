<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Video;
use Illuminate\Database\Seeder;

class VideoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@uepg.br')->first();

        $videos = [
            [
                'title' => 'Técnicas de Organização para TDAH',
                'description' => 'Aprenda estratégias práticas de organização e planejamento adaptadas para estudantes com TDAH.',
                'category' => 'Organização',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration_seconds' => 720,
                'order' => 1,
            ],
            [
                'title' => 'Bem-Estar e Saúde Mental na Universidade',
                'description' => 'Dicas de autocuidado e manejo do estresse durante a vida universitária.',
                'category' => 'Bem-estar',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration_seconds' => 540,
                'order' => 2,
            ],
            [
                'title' => 'Comunicação Assertiva no Ambiente Acadêmico',
                'description' => 'Como se comunicar com professores, colegas e coordenação de forma clara e respeitosa.',
                'category' => 'Comunicação',
                'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                'duration_seconds' => 630,
                'order' => 3,
            ],
        ];

        foreach ($videos as $video) {
            Video::create(array_merge($video, [
                'is_active' => true,
                'created_by' => $admin->id,
            ]));
        }
    }
}
