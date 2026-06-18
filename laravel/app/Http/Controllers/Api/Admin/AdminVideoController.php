<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\VideoResource;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminVideoController extends Controller
{
    public function index(): JsonResponse
    {
        $videos = Video::orderBy('order')->get();

        return response()->json([
            'data' => VideoResource::collection($videos),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'url' => 'required|url|max:500',
            'thumbnail' => 'nullable|image|max:2048',
            'duration_seconds' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $data['created_by'] = $request->user()->id;
        $video = Video::create($data);

        return response()->json([
            'data' => new VideoResource($video),
            'message' => 'Vídeo criado.',
            'status' => 201,
        ], 201);
    }

    public function update(Request $request, Video $video): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'url' => 'sometimes|url|max:500',
            'thumbnail' => 'nullable|image|max:2048',
            'duration_seconds' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer',
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($video->thumbnail) {
                Storage::disk('public')->delete($video->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $video->update($data);

        return response()->json([
            'data' => new VideoResource($video),
            'message' => 'Vídeo atualizado.',
            'status' => 200,
        ]);
    }

    public function destroy(Video $video): JsonResponse
    {
        if ($video->thumbnail) {
            Storage::disk('public')->delete($video->thumbnail);
        }
        $video->delete();

        return response()->json([
            'data' => null,
            'message' => 'Vídeo excluído.',
            'status' => 200,
        ]);
    }
}
