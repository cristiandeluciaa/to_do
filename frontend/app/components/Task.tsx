import { useEffect, useState, useRef, RefObject } from "react";
import AutoResizeTextarea from "./AutoResizeTextarea";
import { IoIosSave } from "react-icons/io";
import { LuCircleMinus } from "react-icons/lu";
import { HiMiniArrowTurnDownRight } from "react-icons/hi2";
import { LiaGripLinesSolid } from "react-icons/lia";
import axios from "axios";

// 🔹 Tipo singolo task
export type TaskType = {
  id?: number;
  titolo: string;
  descrizione: string;
  posizione: number | string | null;
  scadenze: string | null;
  completata: number;
  priority?: string;
};

// 🔹 Props del componente
type TaskProps = {
  task: TaskType;
  priority: string | number;
  onSave?: () => void;
  onDelete?: () => void;
  titoloRef?: RefObject<HTMLInputElement | null>;
  saveButtonRef?: RefObject<HTMLButtonElement | null>;
  dragHandleProps?: any; // meglio di any ✅
};

const Task = ({
  task,
  priority,
  onSave = () => {},
  onDelete = () => {},
  dragHandleProps,
}: TaskProps) => {
  const [formData, setFormData] = useState<TaskType>(task);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const saveButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setFormData(task);
  }, [task]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        saveButtonRef.current?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Gestione modifiche solo in locale
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "titolo" ? value.toUpperCase() : value,
    }));

    setIsEditing(true);
  };

  // Checkbox aggiornamento immediato
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const updatedValue = checked ? 1 : 0;

    setFormData((prev) => ({
      ...prev,
      posizione: "",
      completata: updatedValue,
    }));

    if (task.id) {
      axios
        .post(`${process.env.NEXT_PUBLIC_BE}/task/edit`, {
          ...formData,
          posizione: "",
          completata: updatedValue,
        })
        .then(() => onSave())
        .catch((err) => console.error("Errore aggiornamento completata:", err));
    }
  };

  const handleSave = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BE}/task/${
        formData.id ? "edit" : "add"
      }`;
      await axios.post(url, formData);
      setIsEditing(false);
      onSave();
    } catch (err) {
      console.error("Errore nel salvataggio task:", err);
    }
  };

  const handleDelete = async () => {
    try {
      if (!formData.id) return;
      await axios.delete(`${process.env.NEXT_PUBLIC_BE}/task/del`, {
        data: { id: formData.id },
      });
      onDelete();
    } catch (err) {
      console.error("Errore nella cancellazione del task:", err);
    }
  };

  const handleCopy = async () => {
    try {
      const newScadenza = formData.scadenze
        ? new Date(formData.scadenze)
        : null;
      if (newScadenza) {
        newScadenza.setDate(newScadenza.getDate() + 1);
      }

      // formatter sicuro (evita problemi di timezone)
      const toSQL = (d: Date) =>
        [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, "0"),
          String(d.getDate()).padStart(2, "0"),
        ].join("-");

      await axios.post(`${process.env.NEXT_PUBLIC_BE}/task/add`, {
        ...formData,
        id: undefined, // così non duplichi l'ID
        scadenze: newScadenza ? toSQL(newScadenza) : null,
      });

      // 🔹 non serve fare shiftDate
      // 🔹 non serve aggiungere subito alla lista odierna (perché il task è di domani)
      // richiama solo onSave() per aggiornare eventuali stati locali
      window.location.reload()
    } catch (err) {
      console.error("Errore nel salvataggio task:", err);
    }
  };

  return (
    <div
      className={`${getClassByPriority(
        priority
      )} flex flex-row items-center rounded-sm justify-between py-2 px-3 mb-2 w-full`}
    >
      {/* Checkbox */}
      <div className="w-[5%] flex items-center justify-center">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="completata"
            checked={formData.completata === 1}
            onChange={handleCheckboxChange}
            className="sr-only"
          />
          <div
            className={`w-[2.25vh] h-[2.25vh] border rounded-sm flex items-center justify-center cursor-pointer
                        transition-colors duration-200
                        ${
                          formData.completata === 1
                            ? "bg-[#1B263B] border-[#6f87a0]"
                            : "bg-[#29364e] border-[#949ea9]"
                        }`}
          >
            {formData.completata === 1 && (
              <svg
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </label>
      </div>

      {/* Posizione */}
      <div className="w-[7.5%] mx-2">
        <input
          type="number"
          name="posizione"
          value={formData.posizione ?? ""}
          onChange={handleChange}
          className="border-0 text-center text-[2vh] bg-transparent font-bold focus:outline-none w-full focus:ring-0 [appearance:textfield]"
          placeholder="-"
        />
      </div>

      {/* Titolo + descrizione */}
      <div className="w-[57.5%]">
        <h2
          className={`text-[1.6vh] font-bold ${
            formData.completata ? "line-through text-gray-400" : ""
          }`}
        >
          <AutoResizeTextarea
            name="titolo"
            value={formData.titolo ?? ""}
            onChange={handleChange}
            placeholder="Titolo"
          />
        </h2>
        <p
          className={`text-[1.5vh] ${
            formData.completata ? "line-through text-gray-400" : ""
          }`}
        >
          <AutoResizeTextarea
            name="descrizione"
            value={formData.descrizione ?? ""}
            onChange={handleChange}
            placeholder="descrizione"
          />
        </p>
      </div>

      {/* Azioni */}
      <div className="w-[27.5%] flex items-center justify-end">
        {isEditing && (
          <button ref={saveButtonRef} onClick={handleSave}>
            <IoIosSave className="text-white text-[2.75vh] mr-2 cursor-pointer hover:text-[#bdd1e7]" />
          </button>
        )}
        <button onClick={handleCopy}>
          <HiMiniArrowTurnDownRight className="text-white text-[2.75vh] mr-2 cursor-pointer hover:text-[#bdd1e7]" />
        </button>
        <button onClick={handleDelete}>
          <LuCircleMinus className="text-white text-[2.75vh] cursor-pointer hover:text-red-500" />
        </button>
      </div>

      {/* Linguetta drag */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing ml-[2%] flex items-center"
      >
        <LiaGripLinesSolid className="text-white text-[2vh]" />
      </div>
    </div>
  );
};

const getClassByPriority = (priority: string | number) => {
  switch (priority.toString()) {
    case "3":
      return "bg-[#ff384261]";
    case "2":
      return "bg-[#ffbc007a]";
    case "1":
      return "bg-[#00c95059]";
    case "0":
      return "bg-[#29364e]";
    default:
      return "bg-gray-200";
  }
};

export default Task;
