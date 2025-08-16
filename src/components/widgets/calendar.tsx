"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
        />
      </div>
    </div>
  );
}