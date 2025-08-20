"use client";

import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Task from "./Task";

// 🔹 Tipo riutilizzabile per i task
export type TaskType = {
  id?: number;
  titolo: string;
  descrizione: string;
  posizione: number;
  completata: number;
  priorita: string;
};

// 🔹 Props di SortableTask
type SortableTaskProps = {
  task: TaskType;
  priority: string | number;
  onSave?: () => void;
  onDelete?: () => void;
};

// Task trascinabile
function SortableTask({ task, priority, onSave, onDelete }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id ?? "" });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Task
        task={task}
        priority={priority}
        onSave={onSave}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }} // 👉 passo la linguetta
      />
    </div>
  );
}

const ListComponent = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  const newButtonRef = useRef<HTMLButtonElement | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);
  const titoloRef = useRef<HTMLInputElement | null>(null);

  // Shortcut da tastiera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        newButtonRef.current?.click();
        setTimeout(() => titoloRef.current?.focus(), 50);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        saveButtonRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch task dal backend
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get<TaskType[]>(
        `${process.env.NEXT_PUBLIC_BE}/api/all`
      );
      setTasks(res.data.sort((a, b) => a.posizione - b.posizione));
    } catch (err) {
      console.error("Errore nel fetch dei task:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Salvataggio e refresh
  const handleSave = () => {
    setCreating(false);
    fetchTasks();
  };

  const handleDelete = () => {
    fetchTasks();
  };

  // Gestione drag&drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const newOrder = arrayMove(tasks, oldIndex, newIndex);

    // 🔹 aggiorniamo anche il campo posizione localmente
    const updatedTasks: TaskType[] = newOrder.map((t, index) => ({
      ...t,
      posizione: index,
    }));

    setTasks(updatedTasks);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BE}/api/task/reorder`, {
        tasks: updatedTasks.map((t) => ({
          id: t.id,
          posizione: t.posizione,
        })),
      });
    } catch (err) {
      console.error("Errore nel salvataggio del nuovo ordine:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full p-[2%]">
      {/* Pulsante Nuovo */}
      <button
        ref={newButtonRef}
        className="bg-[#29364e] rounded-sm py-2 px-4 mb-4 w-full font-bold text-[1.6vh] text-center text-white hover:bg-[#3a4a66] transition"
        onClick={() => setCreating(true)}
      >
        + NUOVO TASK
      </button>

      {/* Task in creazione */}
      {creating && (
        <Task
          task={{
            titolo: "",
            descrizione: "",
            posizione: 0,
            completata: 0,
            id: undefined,
          }}
          priority={process.env.NEXT_PUBLIC_AVAILABLE || ""}
          onSave={handleSave}
          onDelete={handleDelete}
          titoloRef={titoloRef}
          saveButtonRef={saveButtonRef}
        />
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(task => task.id ?? `temp-${Math.random()}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 w-full">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                priority={task.priorita}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ListComponent;
