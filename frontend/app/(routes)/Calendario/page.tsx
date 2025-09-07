"use client";

import ListComponent from "@/app/components/List";
import { useDate } from "@/app/context/DateContext";

const Calendar = () => {
  const { centralDate } = useDate();

  const getDateOffset = (offset: number) => {
    const d = new Date(centralDate);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  return (
  <div className="h-full w-full grid grid-cols-3 overflow-hidden">
    <div className="h-full overflow-hidden">
      <ListComponent gg={getDateOffset(-1)} />
    </div>
    <div className="h-full overflow-hidden shadow-2xl bg-[#101b2f] relative">
      <ListComponent gg={centralDate} freccieEnabled />
    </div>
    <div className="h-full overflow-hidden">
      <ListComponent gg={getDateOffset(1)} />
    </div>
  </div>
);

};

export default Calendar;
