<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfessorContactResource;
use App\Models\ProfessorContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfessorContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $contacts = $request->user()->professorContacts()->orderBy('name')->get();

        return response()->json([
            'data' => ProfessorContactResource::collection($contacts),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'department' => 'nullable|string|max:255',
            'discipline' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $contact = $request->user()->professorContacts()->create($data);

        return response()->json([
            'data' => new ProfessorContactResource($contact),
            'message' => 'Contato criado.',
            'status' => 201,
        ], 201);
    }

    public function update(Request $request, ProfessorContact $professorContact): JsonResponse
    {
        $this->authorize('update', $professorContact);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email',
            'department' => 'nullable|string|max:255',
            'discipline' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $professorContact->update($data);

        return response()->json([
            'data' => new ProfessorContactResource($professorContact),
            'message' => 'Contato atualizado.',
            'status' => 200,
        ]);
    }

    public function destroy(Request $request, ProfessorContact $professorContact): JsonResponse
    {
        $this->authorize('delete', $professorContact);
        $professorContact->delete();

        return response()->json([
            'data' => null,
            'message' => 'Contato excluído.',
            'status' => 200,
        ]);
    }
}
