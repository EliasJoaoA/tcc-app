<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\VideoResource;
use App\Models\Video;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Video::where('is_active', true)->orderBy('order');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return response()->json([
            'data' => VideoResource::collection($query->get()),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function show(Video $video): JsonResponse
    {
        return response()->json([
            'data' => new VideoResource($video),
            'message' => 'OK',
            'status' => 200,
        ]);
    }
}
