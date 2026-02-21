"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

export function CalendarClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const selectedDate = searchParams.get("date")
    ? parseDateFromString(searchParams.get("date")!)
    : new Date();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;

    const params = new URLSearchParams(searchParams);
    params.set("date", formatted);
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
