// app/context/DateContext.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type DateContextType = {
  centralDate: string;
  shiftDate: (offset: number) => void;
};

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const today = new Date();
  const [centralDate, setCentralDate] = useState(today.toISOString().split("T")[0]);

  const shiftDate = (offset: number) => {
    const d = new Date(centralDate);
    d.setDate(d.getDate() + offset);
    setCentralDate(d.toISOString().split("T")[0]);
  };

  return (
    <DateContext.Provider value={{ centralDate, shiftDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) throw new Error("useDate must be used within DateProvider");
  return context;
};
