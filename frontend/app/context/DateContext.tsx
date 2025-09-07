"use client";
import Cookies from "js-cookie";
import { createContext, useContext, useState, ReactNode } from "react";

type DateContextType = {
  centralDate: string;
  shiftDate: (offset: number) => void;
  returnToday: () => void;
};

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const initialDate = Cookies.get("lastDate") || new Date().toISOString().split("T")[0];
  const [centralDate, setCentralDate] = useState<string>(initialDate);

  const shiftDate = (offset: number) => {
    const d = new Date(centralDate);
    d.setDate(d.getDate() + offset);
    setCentralDate(d.toISOString().split("T")[0]);
    Cookies.set("lastDate", d.toISOString().split("T")[0]);
  };

  const returnToday = () => {
    const now = new Date();
    setCentralDate(now.toISOString().split("T")[0]);
    Cookies.set("lastDate", now.toISOString().split("T")[0]);
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
