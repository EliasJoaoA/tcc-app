<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupportContactResource;
use App\Models\SupportContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $contacts = $request->user()
            ->supportContacts()
            ->orderByDesc('is_primary')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => SupportContactResource::collection($contacts),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'relationship' => 'nullable|string|max:255',
            'is_primary' => 'sometimes|boolean',
        ]);

        // O primeiro contato do usuário vira o principal automaticamente.
        $isFirst = $request->user()->supportContacts()->count() === 0;
        $data['is_primary'] = $isFirst || ($data['is_primary'] ?? false);

        $contact = $request->user()->supportContacts()->create($data);

        if ($contact->is_primary) {
            $this->makePrimary($contact);
        }

        return response()->json([
            'data' => new SupportContactResource($contact->fresh()),
            'message' => 'Contato de apoio criado.',
            'status' => 201,
        ], 201);
    }

    public function update(Request $request, SupportContact $supportContact): JsonResponse
    {
        $this->authorize('update', $supportContact);

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'relationship' => 'nullable|string|max:255',
            'is_primary' => 'sometimes|boolean',
        ]);

        $supportContact->update($data);

        if ($data['is_primary'] ?? false) {
            $this->makePrimary($supportContact);
        }

        return response()->json([
            'data' => new SupportContactResource($supportContact->fresh()),
            'message' => 'Contato de apoio atualizado.',
            'status' => 200,
        ]);
    }

    public function destroy(Request $request, SupportContact $supportContact): JsonResponse
    {
        $this->authorize('delete', $supportContact);

        $wasPrimary = $supportContact->is_primary;
        $supportContact->delete();

        // Se o principal foi removido, promove o próximo contato restante.
        if ($wasPrimary) {
            $next = $request->user()->supportContacts()->orderBy('name')->first();
            if ($next) {
                $this->makePrimary($next);
            }
        }

        return response()->json([
            'data' => null,
            'message' => 'Contato de apoio excluído.',
            'status' => 200,
        ]);
    }

    /**
     * Garante que apenas o contato informado fique como principal.
     */
    private function makePrimary(SupportContact $contact): void
    {
        SupportContact::where('user_id', $contact->user_id)
            ->where('id', '!=', $contact->id)
            ->update(['is_primary' => false]);

        if (! $contact->is_primary) {
            $contact->update(['is_primary' => true]);
        }
    }
}
