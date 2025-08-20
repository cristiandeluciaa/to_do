import { useRef, useEffect } from "react";

type AutoResizeTextareaProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  placeholder?: string;
};

const AutoResizeTextarea = ({ value, onChange, name, placeholder } : AutoResizeTextareaProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto"; // reset
      ref.current.style.height = ref.current.scrollHeight + "px"; // nuova altezza
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={1}
      className="w-full border-0 bg-transparent focus:outline-none focus:ring-0 resize-none overflow-hidden"
    />
  );
};

export default AutoResizeTextarea;
