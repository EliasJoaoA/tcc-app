<?php

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminEmailTemplateController;
use App\Http\Controllers\Api\Admin\AdminMapPointController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminVideoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailTemplateController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MapController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfessorContactController;
use App\Http\Controllers\Api\SosController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Autenticação — público
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // Mapa — leitura pública
    Route::get('map/points', [MapController::class, 'index']);
    Route::get('map/points/{mapPoint}', [MapController::class, 'show']);

    // Rotas autenticadas
    Route::middleware('auth:sanctum')->group(function () {

        // Autenticação
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Usuário
        Route::get('user/profile', [UserController::class, 'profile']);
        Route::put('user/profile', [UserController::class, 'updateProfile']);
        Route::put('user/preferences', [UserController::class, 'updatePreferences']);
        Route::put('user/avatar', [UserController::class, 'updateAvatar']);
        Route::delete('user/account', [UserController::class, 'deleteAccount']);

        // Eventos
        Route::get('events/export', [EventController::class, 'export']);
        Route::get('events', [EventController::class, 'index']);
        Route::post('events', [EventController::class, 'store']);
        Route::get('events/{event}', [EventController::class, 'show']);
        Route::put('events/{event}', [EventController::class, 'update']);
        Route::delete('events/{event}', [EventController::class, 'destroy']);

        // Tarefas
        Route::get('tasks', [TaskController::class, 'index']);
        Route::post('tasks', [TaskController::class, 'store']);
        Route::put('tasks/{task}', [TaskController::class, 'update']);
        Route::patch('tasks/{task}/toggle-done', [TaskController::class, 'toggleDone']);
        Route::delete('tasks/{task}', [TaskController::class, 'destroy']);

        // Comunica Fácil — templates
        Route::get('email-templates', [EmailTemplateController::class, 'index']);
        Route::get('email-templates/{emailTemplate}', [EmailTemplateController::class, 'show']);

        // Comunica Fácil — contatos
        Route::get('professor-contacts', [ProfessorContactController::class, 'index']);
        Route::post('professor-contacts', [ProfessorContactController::class, 'store']);
        Route::put('professor-contacts/{professorContact}', [ProfessorContactController::class, 'update']);
        Route::delete('professor-contacts/{professorContact}', [ProfessorContactController::class, 'destroy']);

        // SOS Bem-Estar
        Route::get('sos/resources', [SosController::class, 'resources']);
        Route::get('sos/nearest-calm-point', [SosController::class, 'nearestCalmPoint']);

        // Vídeos
        Route::get('videos', [VideoController::class, 'index']);
        Route::get('videos/{video}', [VideoController::class, 'show']);

        // Notificações
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Painel Admin
        Route::middleware('role:admin')->prefix('admin')->group(function () {

            // Dashboard
            Route::get('dashboard', [AdminDashboardController::class, 'index']);

            // Vídeos
            Route::get('videos', [AdminVideoController::class, 'index']);
            Route::post('videos', [AdminVideoController::class, 'store']);
            Route::put('videos/{video}', [AdminVideoController::class, 'update']);
            Route::delete('videos/{video}', [AdminVideoController::class, 'destroy']);

            // Pontos do Mapa
            Route::get('map-points', [AdminMapPointController::class, 'index']);
            Route::post('map-points', [AdminMapPointController::class, 'store']);
            Route::post('map-points/extract-coords', [AdminMapPointController::class, 'extractCoords']);
            Route::put('map-points/{mapPoint}', [AdminMapPointController::class, 'update']);
            Route::delete('map-points/{mapPoint}', [AdminMapPointController::class, 'destroy']);

            // Templates de E-mail
            Route::get('email-templates', [AdminEmailTemplateController::class, 'index']);
            Route::post('email-templates', [AdminEmailTemplateController::class, 'store']);
            Route::put('email-templates/{emailTemplate}', [AdminEmailTemplateController::class, 'update']);
            Route::delete('email-templates/{emailTemplate}', [AdminEmailTemplateController::class, 'destroy']);

            // Usuários
            Route::get('users', [AdminUserController::class, 'index']);
            Route::get('users/{user}', [AdminUserController::class, 'show']);
            Route::patch('users/{user}/role', [AdminUserController::class, 'updateRole']);
        });
    });
});
