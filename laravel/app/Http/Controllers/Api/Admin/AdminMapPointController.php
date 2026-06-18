<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MapPointResource;
use App\Models\MapPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMapPointController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => MapPointResource::collection(MapPoint::all()),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:quiet_zone,rest_point,building,service',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'floor' => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ]);

        $data['created_by'] = $request->user()->id;
        $point = MapPoint::create($data);

        return response()->json([
            'data' => new MapPointResource($point),
            'message' => 'Ponto criado.',
            'status' => 201,
        ], 201);
    }

    public function update(Request $request, MapPoint $mapPoint): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:quiet_zone,rest_point,building,service',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'floor' => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
        ]);

        $mapPoint->update($data);

        return response()->json([
            'data' => new MapPointResource($mapPoint),
            'message' => 'Ponto atualizado.',
            'status' => 200,
        ]);
    }

    public function destroy(MapPoint $mapPoint): JsonResponse
    {
        $mapPoint->delete();

        return response()->json([
            'data' => null,
            'message' => 'Ponto excluído.',
            'status' => 200,
        ]);
    }

    public function extractCoords(Request $request): JsonResponse
    {
        $request->validate(['url' => 'required|string']);
        $url = trim($request->input('url'));

        // Se for link encurtado, resolve o redirect
        if (preg_match('/(maps\.app\.goo\.gl|goo\.gl\/maps)/i', $url)) {
            try {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_MAXREDIRS => 5,
                    CURLOPT_TIMEOUT => 10,
                    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    CURLOPT_SSL_VERIFYPEER => false,
                ]);
                $body = curl_exec($ch);
                $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
                curl_close($ch);
                $url = $finalUrl;

                // Procura coordenadas também no corpo HTML caso a URL final não tenha
                if ($body && !$this->matchCoords($url)) {
                    $url = $body;
                }
            } catch (\Exception $e) {
                return response()->json([
                    'data' => null,
                    'message' => 'Erro ao resolver o link.',
                    'status' => 422,
                ], 422);
            }
        }

        $coords = $this->matchCoords($url);
        if (!$coords) {
            return response()->json([
                'data' => null,
                'message' => 'Não foi possível extrair coordenadas da URL.',
                'status' => 422,
            ], 422);
        }

        return response()->json([
            'data' => $coords,
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    private function matchCoords(string $content): ?array
    {
        $patterns = [
            '/@(-?\d+\.\d+),(-?\d+\.\d+)/',
            '/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/',
            '/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/',
            '/\/(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/',
            '/"latitude":(-?\d+\.\d+),"longitude":(-?\d+\.\d+)/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $content, $m)) {
                return [
                    'latitude' => (float) $m[1],
                    'longitude' => (float) $m[2],
                ];
            }
        }

        return null;
    }
}
