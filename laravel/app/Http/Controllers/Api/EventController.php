<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\UepgSchedulePdfParser;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->events();

        if ($request->filled('date')) {
            $date   = CarbonImmutable::parse($request->date)->startOfDay();
            $events = $query->orderBy('starts_at')->get()->filter(function (Event $event) use ($date) {
                if (! $event->is_recurring) {
                    return $event->starts_at?->isSameDay($date);
                }

                if ($event->starts_at?->startOfDay()->greaterThan($date)) {
                    return false;
                }

                preg_match('/BYDAY=([A-Z]{2})/', $event->recurrence_rule ?? '', $match);
                $dayCodes = [1 => 'MO', 2 => 'TU', 3 => 'WE', 4 => 'TH', 5 => 'FR', 6 => 'SA', 7 => 'SU'];

                return ($match[1] ?? null) === $dayCodes[$date->dayOfWeekIso];
            })->map(function (Event $event) use ($date) {
                if (! $event->is_recurring) {
                    return $event;
                }

                $copy            = $event->replicate();
                $copy->id        = $event->id;
                $copy->starts_at = $date->setTimeFrom($event->starts_at);
                $copy->ends_at   = $event->ends_at ? $date->setTimeFrom($event->ends_at) : null;
                $copy->exists    = true;

                return $copy;
            })->values();
        } else {
            $events = $query->orderBy('starts_at')->get();
        }

        return response()->json([
            'data'    => EventResource::collection($events),
            'message' => 'OK',
            'status'  => 200,
        ]);
    }

    public function previewPdfImport(Request $request, UepgSchedulePdfParser $parser): JsonResponse
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ]);

        try {
            $result = $parser->parse($request->file('pdf')->getRealPath());
            Log::info('PDF processado com sucesso', [
                'user_id'      => $request->user()?->id,
                'events_found' => count($result['events']),
                'semester'     => $result['metadata']['semester'] ?? null,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Falha ao processar PDF de horário', [
                'user_id'   => $request->user()?->id,
                'file_name' => $file->getClientOriginalName(),
                'message'   => $exception->getMessage(),
                'exception' => get_class($exception),
            ]);
            report($exception);

            return response()->json([
                'data'    => null,
                'message' => $exception->getMessage(),
                'status'  => 422,
            ], 422);
        }

        return response()->json([
            'data'    => $result,
            'message' => count($result['events']) . ' aulas encontradas. Revise antes de importar.',
            'status'  => 200,
        ]);
    }

    public function confirmPdfImport(Request $request): JsonResponse
    {
        $data = $request->validate([
            'start_date'           => ['required', 'date'],
            'events'               => ['required', 'array', 'min:1', 'max:50'],
            'events.*.title'       => ['required', 'string', 'max:255'],
            'events.*.location'    => ['nullable', 'string', 'max:255'],
            'events.*.day_of_week' => ['required', 'integer', 'between:1,7'],
            'events.*.start_time'  => ['required', 'date_format:H:i'],
            'events.*.end_time'    => ['required', 'date_format:H:i'],
            'events.*.selected'    => ['sometimes', 'boolean'],
        ]);

        $baseDate = CarbonImmutable::parse($data['start_date'])->startOfDay();
        $dayCodes = [1 => 'MO', 2 => 'TU', 3 => 'WE', 4 => 'TH', 5 => 'FR', 6 => 'SA', 7 => 'SU'];
        $created  = [];
        $skipped  = 0;

        DB::transaction(function () use ($request, $data, $baseDate, $dayCodes, &$created, &$skipped) {
            foreach ($data['events'] as $item) {
                if (array_key_exists('selected', $item) && ! $item['selected']) {
                    continue;
                }

                $daysAhead = ($item['day_of_week'] - $baseDate->dayOfWeekIso + 7) % 7;
                $date      = $baseDate->addDays($daysAhead);
                $startsAt  = CarbonImmutable::parse($date->format('Y-m-d') . ' ' . $item['start_time']);
                $endsAt    = CarbonImmutable::parse($date->format('Y-m-d') . ' ' . $item['end_time']);
                $rule      = 'FREQ=WEEKLY;BYDAY=' . $dayCodes[$item['day_of_week']];

                $duplicate = $request->user()->events()
                    ->where('title', $item['title'])
                    ->where('recurrence_rule', $rule)
                    ->get()
                    ->contains(fn(Event $event) => $event->starts_at?->format('H:i') === $item['start_time']);

                if ($duplicate) {
                    $skipped++;
                    continue;
                }

                $created[] = $request->user()->events()->create([
                    'title'           => $item['title'],
                    'location'        => $item['location'] ?? null,
                    'starts_at'       => $startsAt,
                    'ends_at'         => $endsAt,
                    'color'           => '#2E7D9A',
                    'is_recurring'    => true,
                    'recurrence_rule' => $rule,
                ]);
            }
        });

        return response()->json([
            'data'    => EventResource::collection(collect($created)),
            'message' => count($created) . ' aulas importadas' . ($skipped ? "; {$skipped} duplicadas ignoradas" : '') . '.',
            'status' => 201,
        ], 201);
    }

    public function clearSchedule(Request $request): JsonResponse
    {
        $deleted = $request->user()->events()
            ->where('is_recurring', true)
            ->delete();

        return response()->json([
            'data'    => ['deleted' => $deleted],
            'message' => $deleted === 1
                ? '1 horário removido da grade.'
                : "{$deleted} horários removidos da grade.",
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'           => 'required|string|max:255',
            'location'        => 'nullable|string|max:255',
            'starts_at'       => 'required|date',
            'ends_at'         => 'nullable|date|after_or_equal:starts_at',
            'color'           => 'nullable|string|max:20',
            'is_recurring'    => 'boolean',
            'recurrence_rule' => 'nullable|string|max:255',
        ]);

        $event = $request->user()->events()->create($data);

        return response()->json([
            'data'    => new EventResource($event),
            'message' => 'Evento criado.',
            'status'  => 201,
        ], 201);
    }

    public function show(Request $request, Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return response()->json([
            'data'    => new EventResource($event),
            'message' => 'OK',
            'status'  => 200,
        ]);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        $data = $request->validate([
            'title'           => 'sometimes|string|max:255',
            'location'        => 'nullable|string|max:255',
            'starts_at'       => 'sometimes|date',
            'ends_at'         => 'nullable|date',
            'color'           => 'nullable|string|max:20',
            'is_recurring'    => 'boolean',
            'recurrence_rule' => 'nullable|string|max:255',
        ]);

        $event->update($data);

        return response()->json([
            'data'    => new EventResource($event),
            'message' => 'Evento atualizado.',
            'status'  => 200,
        ]);
    }

    public function destroy(Request $request, Event $event): JsonResponse
    {
        $this->authorize('delete', $event);
        $event->delete();

        return response()->json([
            'data'    => null,
            'message' => 'Evento excluído.',
            'status'  => 200,
        ]);
    }

    public function export(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $now         = now();
        $startOfWeek = $now->startOfWeek()->copy();
        $endOfWeek   = $now->endOfWeek()->copy();

        $events = $request->user()->events()
            ->whereBetween('starts_at', [$startOfWeek, $endOfWeek])
            ->orderBy('starts_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();
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
