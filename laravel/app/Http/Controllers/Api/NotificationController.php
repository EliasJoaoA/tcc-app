<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()
            ->orderByRaw('read_at IS NULL DESC')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'data' => new NotificationResource($notification),
            'message' => 'Notificação marcada como lida.',
            'status' => 200,
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => null,
            'message' => 'Todas as notificações marcadas como lidas.',
            'status' => 200,
        ]);
    }
}
