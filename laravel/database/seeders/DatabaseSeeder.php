<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            MapPointSeeder::class,
            EmailTemplateSeeder::class,
            VideoSeeder::class,
            SosResourceSeeder::class,
        ]);
    }
}
