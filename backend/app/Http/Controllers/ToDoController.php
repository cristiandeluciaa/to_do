<?php

namespace App\Http\Controllers;

use App\Models\ToDo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\Priorita;

class ToDoController
{
    public function all()
    {
        $allTasks = ToDo::orderBy("priorita")->orderBy("posizione")->get();

        return response()->json($allTasks);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            "descrizione" => "required_without:titolo",
            "titolo" => "nullable|max:255",
            "priorita" => "nullable|in:" . implode(",", Priorita::getValues()),
            "posizione" => "nullable|integer|min:0",
            "scadenze" => "nullable",
            "completata" => "nullable|min:0|max:1"
        ]);

        $data["titolo"] = strtoupper($data["titolo"] ?? "");
        $data["priorita"] = $data["priorita"] ?? Priorita::getValues(Priorita::DISPONIBILE);

        DB::transaction(function () use (&$task, $data) {
            // se è stata passata una posizione → shift
            if (!empty($data["posizione"])) {
                ToDo::where("priorita", $data["priorita"])
                    ->where("posizione", ">=", $data["posizione"])
                    ->increment("posizione");
            }else{
                // altrimenti, trova l'ultima posizione disponibile
                $lastPosition = ToDo::where("priorita", $data["priorita"])
                    ->max("posizione");

                $data["posizione"] = $lastPosition !== null ? $lastPosition + 1 : 0;
            }

            $task = ToDo::create($data);
        });

        return response()->json([
            "status" => "success",
            "message" => "Task added successfully",
            "task" => $task
        ]);
    }

    public function edit(Request $request)
    {
        $data = $request->validate([
            "id" => "required|integer|exists:to_do,id",
            "descrizione" => "required_without:titolo",
            "titolo" => "nullable|max:255",
            "priorita" => "nullable|in:" . implode(",", Priorita::getValues()),
            "posizione" => "nullable|integer|min:0",
            "scadenze" => "nullable",
            "completata" => "nullable|min:0|max:1"
        ]);

        $task = ToDo::findOrFail($data["id"]);

        $data["titolo"] = strtoupper($data["titolo"] ?? "");
        $data["priorita"] = $data["priorita"] ?? $task->priorita;
        $newPos = $data["posizione"] ?? $task->posizione;

        DB::transaction(function () use (&$task, $data, $newPos) {
            if ($newPos !== null && $task->posizione !== null && $newPos != $task->posizione) {
                if ($newPos < $task->posizione) {
                    // spostato in alto → quelli tra newPos e oldPos scalano avanti
                    ToDo::where("priorita", $data["priorita"])
                        ->where("posizione", ">=", $newPos)
                        ->where("posizione", "<", $task->posizione)
                        ->increment("posizione");
                } else {
                    // spostato in basso → quelli tra oldPos e newPos scalano indietro
                    ToDo::where("priorita", $data["priorita"])
                        ->where("posizione", "<=", $newPos)
                        ->where("posizione", ">", $task->posizione)
                        ->decrement("posizione");
                }
            } elseif ($newPos !== null && $task->posizione === null) {
                // se prima non aveva posizione e ora sì → fai posto
                ToDo::where("priorita", $data["priorita"])
                    ->where("posizione", ">=", $newPos)
                    ->increment("posizione");
            }

            $task->update($data);
        });

        return response()->json([
            "status" => "success",
            "message" => "Task edited successfully",
            "task" => $task
        ]);
    }

    public function del(Request $request)
    {
        $id = $request->input("id");
        $task = ToDo::findOrFail($id);

        DB::transaction(function () use ($task) {
            // se aveva posizione, scala indietro quelli dopo
            if ($task->posizione !== null) {
                ToDo::where("priorita", $task->priorita)
                    ->where("posizione", ">", $task->posizione)
                    ->decrement("posizione");
            }

            $task->delete();
        });

        return response()->json([
            "status" => "success",
            "message" => "Task deleted successfully"
        ]);
    }

     // Riordina i task
    public function reorder(Request $request)
    {
        $tasks = $request->input('tasks');

        if (!is_array($tasks)) {
            return response()->json(['error' => 'Formato non valido'], 400);
        }

        foreach ($tasks as $taskData) {
            if (isset($taskData['id']) && isset($taskData['posizione'])) {
                ToDo::where('id', $taskData['id'])
                    ->update(['posizione' => $taskData['posizione']]);
            }
        }

        return ToDo::orderBy('posizione')->get();
    }
}
