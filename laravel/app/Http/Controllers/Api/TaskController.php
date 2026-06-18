<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->tasks();

        if ($request->boolean('focus')) {
            $query->where('is_focus', true);
        }

        $tasks = $query->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'message' => 'OK',
            'status' => 200,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'in:low,medium,high',
            'is_focus' => 'boolean',
        ]);

        $task = $request->user()->tasks()->create($data);

        return response()->json([
            'data' => new TaskResource($task),
            'message' => 'Tarefa criada.',
            'status' => 201,
        ], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|in:low,medium,high',
            'is_focus' => 'sometimes|boolean',
            'is_done' => 'sometimes|boolean',
        ]);

        $task->update($data);

        return response()->json([
            'data' => new TaskResource($task),
            'message' => 'Tarefa atualizada.',
            'status' => 200,
        ]);
    }

    public function toggleDone(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);
        $task->update(['is_done' => !$task->is_done]);

        return response()->json([
            'data' => new TaskResource($task),
            'message' => 'Status alterado.',
            'status' => 200,
        ]);
    }

    public function destroy(Request $request, Task $task): JsonResponse
    {
        $this->authorize('delete', $task);
        $task->delete();

        return response()->json([
            'data' => null,
            'message' => 'Tarefa excluída.',
            'status' => 200,
        ]);
    }
}
