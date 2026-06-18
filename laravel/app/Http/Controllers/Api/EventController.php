<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->events();

        if ($request->filled('date')) {
            $query->whereDate('starts_at', $request->date);
        }

        $events = $query->orderBy('starts_at')->get();

        return response()->json([
            'data' => EventResource::collection($events),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'color' => 'nullable|string|max:20',
            'is_recurring' => 'boolean',
            'recurrence_rule' => 'nullable|string|max:255',
        ]);

        $event = $request->user()->events()->create($data);

        return response()->json([
            'data' => new EventResource($event),
            'message' => 'Evento criado.',
            'status' => 201,
        ], 201);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return response()->json([
            'data' => new EventResource($event),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'starts_at' => 'sometimes|date',
            'ends_at' => 'nullable|date',
            'color' => 'nullable|string|max:20',
            'is_recurring' => 'boolean',
            'recurrence_rule' => 'nullable|string|max:255',
        ]);

        $event->update($data);

        return response()->json([
            'data' => new EventResource($event),
            'message' => 'Evento atualizado.',
            'status' => 200,
        ]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $this->authorize('delete', $event);
        $event->delete();

        return response()->json([
            'data' => null,
            'message' => 'Evento excluído.',
            'status' => 200,
        ]);
    }

    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $now = now();
        $startOfWeek = $now->startOfWeek()->copy();
        $endOfWeek = $now->endOfWeek()->copy();

        $events = $request->user()->events()
            ->whereBetween('starts_at', [$startOfWeek, $endOfWeek])
            ->orderBy('starts_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Agenda da Semana');
        $sheet->fromArray(['Evento', 'Local', 'Início', 'Fim', 'Recorrente'], null, 'A1');

        foreach ($events as $i => $event) {
            $sheet->fromArray([
                $event->title,
                $event->location,
                $event->starts_at?->format('d/m/Y H:i'),
                $event->ends_at?->format('d/m/Y H:i'),
                $event->is_recurring ? 'Sim' : 'Não',
            ], null, 'A' . ($i + 2));
        }

        $writer = new Xlsx($spreadsheet);

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, 'agenda-semana.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
