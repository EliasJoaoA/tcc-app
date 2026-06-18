<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MapPointResource;
use App\Http\Resources\SosResourceResource;
use App\Models\MapPoint;
use App\Models\SosResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SosController extends Controller
{
    public function resources(): JsonResponse
    {
        $resources = SosResource::where('is_active', true)->with('mapPoint')->get();

        return response()->json([
            'data' => SosResourceResource::collection($resources),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function nearestCalmPoint(Request $request): JsonResponse
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $lat = (float) $request->lat;
        $lng = (float) $request->lng;

        $point = MapPoint::where('is_active', true)
            ->where('type', 'quiet_zone')
            ->get()
            ->sortBy(function (MapPoint $point) use ($lat, $lng) {
                return $this->haversine($lat, $lng, $point->latitude, $point->longitude);
            })
            ->first();

        if (!$point) {
            return response()->json([
                'data' => null,
                'message' => 'Nenhum ponto calmo encontrado.',
                'status' => 404,
            ], 404);
        }

        return response()->json([
            'data' => new MapPointResource($point),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
