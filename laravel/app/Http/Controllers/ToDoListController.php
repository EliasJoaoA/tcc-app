<?php
namespace App\Http\Controllers;

use App\Models\ToDoList;
use Exception;

class ToDoListController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'List of to-do items']);
    }

    public function store($request)
    {
        // passar isso para um arquivo de request posteriormente
        $data = request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'start_date'   => 'nullable|date',
            'end_date'     => 'nullable|date|after_or_equal:start_date',
            'is_completed' => 'boolean',
        ]);
    }
    public function update($id, $request)
    {
        try {
            $toDoList = ToDoList::findOrFail($id);
            // passar isso para um arquivo de request posteriormente
            $data = request->validate([
                'title'        => 'required|string|max:255',
                'description'  => 'nullable|string',
                'start_date'   => 'nullable|date',
                'end_date'     => 'nullable|date|after_or_equal:start_date',
                'is_completed' => 'boolean',
            ]);
            $toDoList->update($data);
            return response()->json(['message' => 'To-do item updated successfully']);

        } catch (Exception $e) {
            return response()->json(['message' => 'To-do item not found'], 404);
        }

        $toDoList = ToDoList::findOrFail($id);
        $toDoList->update($data);
    }
    public function delete($id, $request)
    {
        try {
            $toDoList = ToDoList::findOrFail($id);
            $toDoList->delete();
            return response()->json(['message' => 'To-do item deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => 'To-do item not found'], 404);
        }
    }

}
