<?php

namespace App\Http\Controllers;

use App\Models\ToDo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\Priorita;

class ToDoController
{
    // 🔹 Recupera tutti i task, eventualmente filtrando per scadenze
    public function all(Request $request)
    {
        $scadenze = $request->input('scadenze', null); 

        $query = ToDo::query();

        if ($scadenze) {
            $query->whereDate('scadenze', $scadenze);
        }else{
            $query->whereNull('scadenze');
        }

        $allTasks = $query->orderByRaw("completata = 'S', priorita, posizione")
                          ->orderByDesc('updated_at')
                          ->get();

        return response()->json($allTasks);
    }

    // 🔹 Aggiungi nuovo task
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
        $data["scadenze"] = $data["scadenze"] ?? null;

        DB::transaction(function () use (&$task, $data) {
            // Shift posizioni se necessario
            if (!empty($data["posizione"])) {
                ToDo::where("priorita", $data["priorita"])
                    ->where("posizione", ">=", $data["posizione"])
                    ->increment("posizione");
            } else {
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

    // 🔹 Modifica task
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
        $data["scadenze"] = $data["scadenze"] ?? $task->scadenze;
        $newPos = $data["posizione"] ?? $task->posizione;

        DB::transaction(function () use (&$task, $data, $newPos) {
            // Spostamento posizioni solo se non completato
            if ($task->completata !== "S" && ($data["completata"] ?? $task->completata) !== "S") {
                if ($newPos !== null && $task->posizione !== null && $newPos != $task->posizione) {
                    if ($newPos < $task->posizione) {
                        ToDo::where("priorita", $data["priorita"])
                            ->where("posizione", ">=", $newPos)
                            ->where("posizione", "<", $task->posizione)
                            ->increment("posizione");
                    } else {
                        ToDo::where("priorita", $data["priorita"])
                            ->where("posizione", "<=", $newPos)
                            ->where("posizione", ">", $task->posizione)
                            ->decrement("posizione");
                    }
                } elseif ($newPos !== null && $task->posizione === null) {
                    ToDo::where("priorita", $data["priorita"])
                        ->where("posizione", ">=", $newPos)
                        ->increment("posizione");
                }
            }

            // Se completato → metti in fondo
            if (($data["completata"] ?? $task->completata) === "S") {
                $lastPos = ToDo::where("priorita", $task->priorita)
                    ->where("completata", "N")
                    ->max("posizione");
                $data["posizione"] = $lastPos !== null ? $lastPos + 1 : 0;
            }

            $task->update($data);
        });

        return response()->json([
            "status" => "success",
            "message" => "Task edited successfully",
            "task" => $task
        ]);
    }

    // 🔹 Cancella task
    public function del(Request $request)
    {
        $id = $request->input("id");
        $task = ToDo::findOrFail($id);

        DB::transaction(function () use ($task) {
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

    // 🔹 Riordina i task
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