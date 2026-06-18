<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmailTemplateResource;
use App\Models\EmailTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEmailTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => EmailTemplateResource::collection(EmailTemplate::orderBy('order')->get()),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|in:professor,group,coordination,other',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'is_active' => 'boolean',
            'order' => 'integer',
        ]);

        $template = EmailTemplate::create($data);

        return response()->json([
            'data' => new EmailTemplateResource($template),
            'message' => 'Template criado.',
            'status' => 201,
        ], 201);
    }

    public function update(Request $request, EmailTemplate $emailTemplate): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:professor,group,coordination,other',
            'subject' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'order' => 'sometimes|integer',
        ]);

        $emailTemplate->update($data);

        return response()->json([
            'data' => new EmailTemplateResource($emailTemplate),
            'message' => 'Template atualizado.',
            'status' => 200,
        ]);
    }

    public function destroy(EmailTemplate $emailTemplate): JsonResponse
    {
        $emailTemplate->delete();

        return response()->json([
            'data' => null,
            'message' => 'Template excluído.',
            'status' => 200,
        ]);
    }
}
