import { getUserWorkouts } from "@/data/user-workouts";
import { format } from "date-fns";
import { CalendarClient } from "./calendar-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import Link from "next/link";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Workout Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent searchParams={params} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const formatDateWithOrdinal = (date: Date) => {
    return format(date, "do MMM yyyy");
  };

  const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const selectedDate = searchParams.date
    ? parseDateFromString(searchParams.date)
    : new Date();
  const workouts = await getUserWorkouts(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Workouts for {formatDateWithOrdinal(selectedDate)}
        </h2>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/workout/new">
            <Button>Log New Workout</Button>
          </Link>
          <CalendarClient />
        </div>
      </div>

      <div className="space-y-4">
        {workouts.length > 0 ? (
          workouts.map((workout) => (
            <Link key={workout.id} href={`/dashboard/workout/${workout.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{workout.name}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {format(workout.startedAt, "h:mm a")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{workout.completedAt ? "Completed" : "In Progress"}</span>
                    {workout.completedAt && (
                      <span>
                        • Duration:{" "}
                        {Math.round(
                          (new Date(workout.completedAt).getTime() -
                            new Date(workout.startedAt).getTime()) /
                            (1000 * 60)
                        )}{" "}
                        min
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No workouts logged for this date
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
