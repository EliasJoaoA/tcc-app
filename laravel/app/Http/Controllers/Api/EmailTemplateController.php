<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmailTemplateResource;
use App\Models\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EmailTemplate::where('is_active', true)->orderBy('order');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        return response()->json([
            'data' => EmailTemplateResource::collection($query->get()),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function show(EmailTemplate $emailTemplate): JsonResponse
    {
        return response()->json([
            'data' => new EmailTemplateResource($emailTemplate),
            'message' => 'OK',
            'status' => 200,
        ]);
    }
}
