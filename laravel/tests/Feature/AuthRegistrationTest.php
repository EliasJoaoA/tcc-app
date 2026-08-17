<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a student can create an account and receives a token', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => '  Maria Estudante  ',
        'email' => 'MARIA@EXAMPLE.COM',
        'course' => ' Engenharia ',
        'password' => 'senha-segura',
        'password_confirmation' => 'senha-segura',
    ])->assertCreated()
        ->assertJsonPath('data.user.email', 'maria@example.com')
        ->assertJsonPath('data.user.role', 'student')
        ->assertJsonStructure(['data' => ['token']]);

    $user = User::firstOrFail();
    expect($user->preferences)->not->toBeNull();
});

test('registration validation messages are readable', function () {
    User::factory()->create(['email' => 'existente@example.com']);

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Teste',
        'email' => 'existente@example.com',
        'password' => '12345678',
        'password_confirmation' => '12345678',
    ])->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'Já existe uma conta com este e-mail.');
});
