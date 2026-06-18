<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('preferences');

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $request->user()->id,
            'course' => 'nullable|string|max:255',
            'support_contact_name' => 'nullable|string|max:255',
            'support_contact_phone' => 'nullable|string|max:20',
        ]);

        $request->user()->update($data);

        return response()->json([
            'data' => new UserResource($request->user()->fresh()->load('preferences')),
            'message' => 'Perfil atualizado.',
            'status' => 200,
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $data = $request->validate([
            'font_size' => 'sometimes|in:small,medium,large',
            'high_contrast' => 'sometimes|boolean',
            'calm_color_scheme' => 'nullable|string|max:50',
            'auto_captions' => 'sometimes|boolean',
            'reduce_animations' => 'sometimes|boolean',
            'notifications_enabled' => 'sometimes|boolean',
            'notifications_deadline_hours' => 'sometimes|integer|min:1|max:168',
        ]);

        $request->user()->preferences()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json([
            'data' => $request->user()->fresh()->load('preferences')->preferences,
            'message' => 'Preferências atualizadas.',
            'status' => 200,
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'data' => ['avatar' => asset('storage/' . $path)],
            'message' => 'Avatar atualizado.',
            'status' => 200,
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        if (!\Illuminate\Support\Facades\Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'data' => null,
                'message' => 'Senha incorreta.',
                'status' => 422,
            ], 422);
        }

        $request->user()->delete();

        return response()->json([
            'data' => null,
            'message' => 'Conta excluída.',
            'status' => 200,
        ]);
    }
}
