<?php

use App\Models\User;
use App\Services\UepgSchedulePdfParser;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

test('an invalid schedule PDF returns the parser message instead of a server error', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->mock(UepgSchedulePdfParser::class)
        ->shouldReceive('parse')
        ->once()
        ->andThrow(new \RuntimeException('O arquivo não parece ser um Extrato de Matrícula da UEPG.'));

    $pdf = UploadedFile::fake()->createWithContent(
        'extrato.pdf',
        "%PDF-1.4\n% arquivo de teste\n",
    );

    $this->post('/api/v1/events/import-pdf/preview', ['pdf' => $pdf], [
        'Accept' => 'application/json',
    ])
        ->assertUnprocessable()
        ->assertJsonPath('message', 'O arquivo não parece ser um Extrato de Matrícula da UEPG.');
});

test('it imports selected schedule items as weekly events and ignores duplicates', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $payload = [
        'start_date' => '2026-08-04',
        'events' => [[
            'title' => 'Automação de Sistemas',
            'location' => 'L-1-8',
            'day_of_week' => 2,
            'start_time' => '10:05',
            'end_time' => '11:55',
            'selected' => true,
        ]],
    ];

    $this->postJson('/api/v1/events/import-pdf/confirm', $payload)
        ->assertCreated()
        ->assertJsonPath('data.0.recurrence_rule', 'FREQ=WEEKLY;BYDAY=TU');

    $this->postJson('/api/v1/events/import-pdf/confirm', $payload)
        ->assertCreated()
        ->assertJsonCount(0, 'data');

    $this->assertDatabaseCount('events', 1);
});

test('weekly imported events appear on matching future dates', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $user->events()->create([
        'title' => 'Automação de Sistemas',
        'location' => 'L-1-8',
        'starts_at' => CarbonImmutable::parse('2026-08-04 10:05'),
        'ends_at' => CarbonImmutable::parse('2026-08-04 11:55'),
        'is_recurring' => true,
        'recurrence_rule' => 'FREQ=WEEKLY;BYDAY=TU',
    ]);

    $this->getJson('/api/v1/events?date=2026-08-11')
        ->assertOk()
        ->assertJsonPath('data.0.title', 'Automação de Sistemas')
        ->assertJsonPath('data.0.starts_at', '2026-08-11T10:05:00.000000Z');

    $this->getJson('/api/v1/events?date=2026-08-12')
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

test('a student can clear only their recurring schedule events', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    Sanctum::actingAs($user);

    foreach ([[$user, true], [$user, false], [$otherUser, true]] as [$owner, $recurring]) {
        $owner->events()->create([
            'title' => $recurring ? 'Aula recorrente' : 'Evento avulso',
            'starts_at' => CarbonImmutable::parse('2026-08-04 10:05'),
            'ends_at' => CarbonImmutable::parse('2026-08-04 11:55'),
            'is_recurring' => $recurring,
            'recurrence_rule' => $recurring ? 'FREQ=WEEKLY;BYDAY=TU' : null,
        ]);
    }

    $this->deleteJson('/api/v1/events/schedule')
        ->assertOk()
        ->assertJsonPath('data.deleted', 1);

    expect($user->events()->count())->toBe(1)
        ->and($user->events()->first()->is_recurring)->toBeFalse()
        ->and($otherUser->events()->count())->toBe(1);
});
