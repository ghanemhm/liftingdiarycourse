"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

interface CalendarClientProps {
  selectedDate: string; // "YYYY-MM-DD"
}

export function CalendarClient({ selectedDate: selectedDateStr }: CalendarClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [year, month, day] = selectedDateStr.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    const params = new URLSearchParams(searchParams);
    params.set("date", `${y}-${m}-${d}`);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md"
    />
  );
}
