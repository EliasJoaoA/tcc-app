<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('preferences')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'data' => UserResource::collection($users),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('preferences');

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => 'required|in:student,admin',
        ]);

        $user->update(['role' => $request->role]);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'Papel atualizado.',
            'status' => 200,
        ]);
    }
}
