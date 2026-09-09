<?php

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

// Redireciona a raiz para o painel administrativo.
Route::get('/', fn () => redirect('/painel'));

/*
 * Painel administrativo (Angular) servido a partir de laravel/public/painel.
 * Os arquivos estáticos (JS/CSS) são entregues direto pelo servidor web;
 * qualquer rota interna do Angular cai aqui e recebe o index.html (SPA),
 * permitindo deep-links como /painel/usuarios.
 */
$servePainel = function () {
    $index = public_path('painel/index.html');

    abort_unless(File::exists($index), 404, 'Painel ainda não foi publicado.');

    return response(File::get($index), 200, ['Content-Type' => 'text/html']);
};

Route::get('/painel', $servePainel);
Route::get('/painel/{any}', $servePainel)->where('any', '.*');
