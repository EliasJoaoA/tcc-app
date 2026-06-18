<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MapPointResource;
use App\Models\MapPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MapController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MapPoint::where('is_active', true);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json([
            'data' => MapPointResource::collection($query->get()),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function show(MapPoint $mapPoint): JsonResponse
    {
        return response()->json([
            'data' => new MapPointResource($mapPoint),
            'message' => 'OK',
            'status' => 200,
        ]);
    }
}
