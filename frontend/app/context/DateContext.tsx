"use client";
import Cookies from "js-cookie";
import { createContext, useContext, useState, ReactNode } from "react";

type DateContextType = {
  centralDate: string;
  shiftDate: (offset: number) => void;
  returnToday: () => void;
};

const DateContext = createContext<DateContextType | undefined>(undefined);

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const initialDate = Cookies.get("lastDate") || formatLocalDate(new Date());
  const [centralDate, setCentralDate] = useState<string>(initialDate);

  const shiftDate = (offset: number) => {
    const d = parseLocalDate(centralDate);
    d.setDate(d.getDate() + offset);

    const newDate = formatLocalDate(d);
    setCentralDate(newDate);
    Cookies.set("lastDate", newDate);
  };

  const returnToday = () => {
    const today = formatLocalDate(new Date());
    setCentralDate(today);
    Cookies.set("lastDate", today);
  };

  return (
    <DateContext.Provider value={{ centralDate, shiftDate, returnToday }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) throw new Error("useDate must be used within DateProvider");
  return context;
};