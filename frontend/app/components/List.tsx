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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useDate } from "@/app/context/DateContext"; // context per la data

// Tipo riutilizzabile per i task
export type TaskType = {
  id?: number;
  titolo: string;
  descrizione: string;
  posizione: number | string | null;
  completata: number;
  scadenze: string | null;
  priorita: string;
  updated_at: string;
};

type SortableTaskProps = {
  task: TaskType;
  priority: string | number;
  onSave?: () => void;
  onDelete?: () => void;
};

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
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

const ListComponent = ({
  gg = null,
  freccieEnabled = false,
}: {
  gg: string | null;
  freccieEnabled?: boolean;
}) => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState<boolean>(false);

  const { shiftDate } = useDate(); // context per cambiare giorno centrale

  const newButtonRef = useRef<HTMLButtonElement | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement | null>(null);
  const titoloRef = useRef<HTMLInputElement | null>(null);

  // Funzione ordinamento
  const sortTasks = (arr: TaskType[]) => {
    const nonCompleted = arr
      .filter((t) => t.completata === 0)
      .sort((a, b) =>
        a.priorita === b.priorita
          ? Number(a.posizione ?? 0) - Number(b.posizione ?? 0)
          : a.priorita.localeCompare(b.priorita)
      )
      .map((t, idx) => ({ ...t, posizione: idx }));

    const completed = arr
      .filter((t) => t.completata === 1)
      .map((t) => ({ ...t, posizione: null }))
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    return [...nonCompleted, ...completed];
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        (target as HTMLElement).isContentEditable;

      // Shortcut globali solo se non stiamo scrivendo
      if (!isInput) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "l") {
          e.preventDefault();
          newButtonRef.current?.click();
          setTimeout(() => titoloRef.current?.focus(), 50);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          saveButtonRef.current?.click();
        }

        // Frecce solo se abilitate e non stiamo scrivendo
        if (freccieEnabled) {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            shiftDate(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            shiftDate(1);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [freccieEnabled, shiftDate]);

  // Fetch
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get<TaskType[]>(
        `${process.env.NEXT_PUBLIC_BE}/all`,
        { params: { scadenze: gg } }
      );
      setTasks(sortTasks(res.data));
    } catch (err) {
      console.error("Errore nel fetch dei task:", err);
    } finally {
      setLoading(false);
    }
  }, [gg]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSave = () => {
    setCreating(false);
    fetchTasks();
  };

  const handleDelete = () => {
    fetchTasks();
  };

  // Drag&drop → solo tra i non completati
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overTask = tasks.find((t) => t.id === over.id);

    if (
      !activeTask ||
      !overTask ||
      activeTask.completata ||
      overTask.completata
    )
      return;

    const nonCompleted = tasks.filter((t) => t.completata === 0);
    const oldIndex = nonCompleted.findIndex((t) => t.id === active.id);
    const newIndex = nonCompleted.findIndex((t) => t.id === over.id);

    const moved = arrayMove(nonCompleted, oldIndex, newIndex);

    const updated: TaskType[] = [
      ...moved.map((t, idx) => ({ ...t, posizione: idx })),
      ...tasks
        .filter((t) => t.completata === 1)
        .map((t) => ({ ...t, posizione: null })),
    ];

    setTasks(updated);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BE}/task/reorder`, {
        tasks: moved.map((t, idx) => ({ id: t.id, posizione: idx })),
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

  // Controllo se oggi
  const today = new Date();
  const todaySQL = today.toISOString().split("T")[0];
  const isToday = gg === todaySQL;

  return (
    <div className="flex flex-col items-center w-full h-full p-[2%]">
      {gg ? (
        <div
          className={`flex uppercase items-center mb-[2%] text-[2vh] p-[1%] w-full font-bold ${
            freccieEnabled ? "shadow-md justify-between" : "justify-center"
          }`}
        >
          {freccieEnabled && (
            <button
              className="mr-2 hover:scale-110 transition cursor-pointer"
              onClick={() => shiftDate(-1)}
            >
              <FaChevronLeft />
            </button>
          )}
          <span>
            {new Intl.DateTimeFormat("it-IT", { weekday: "long" }).format(
              new Date(gg)
            )}
            {" - "}
            {new Date(gg).getDate()}{" "}
            {new Intl.DateTimeFormat("it-IT", { month: "long" }).format(
              new Date(gg)
            )}{" "}
            {new Date(gg).getFullYear()}
          </span>
          {freccieEnabled && (
            <button
              className="ml-2 hover:scale-110 transition cursor-pointer"
              onClick={() => shiftDate(1)}
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center mb-[2%] p-[1%] w-full text-[2vh] font-bold">
          TASK GENERICI
        </div>
      )}

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
            scadenze: gg,
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
        <SortableContext
          items={tasks.map((task, idx) => task.id ?? `temp-${idx}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 overflow-auto scrollbar-hide w-full">
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
