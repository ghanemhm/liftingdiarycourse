import { getUserWorkouts } from "@/data/user-workouts";
import { format } from "date-fns";
import { CalendarClient } from "./calendar-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="container mx-auto p-6 max-w-5xl">
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
  const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const selectedDate = searchParams.date
    ? parseDateFromString(searchParams.date)
    : new Date();

  const workouts = await getUserWorkouts(selectedDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Left column: calendar */}
      <div>
        <h2 className="text-base font-semibold mb-4">Select Date</h2>
        <Card className="inline-block">
          <CardContent className="p-2">
            <CalendarClient />
          </CardContent>
        </Card>
      </div>

      {/* Right column: workouts */}
      <div>
        <h2 className="text-base font-semibold mb-4">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

        <div className="space-y-3">
          {workouts.length > 0 ? (
            workouts.map((workout) => {
              const exerciseNames = workout.workoutExercises.map(
                (we) => we.exercise.name
              );
              const durationMin =
                workout.completedAt
                  ? Math.round(
                      (new Date(workout.completedAt).getTime() -
                        new Date(workout.startedAt).getTime()) /
                        (1000 * 60)
                    )
                  : null;

              return (
                <Link key={workout.id} href={`/dashboard/workout/${workout.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-semibold">
                          {workout.name}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {format(workout.startedAt, "h:mm a")}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {exerciseNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {exerciseNames.map((name) => (
                            <Badge key={name} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {durationMin !== null
                          ? `Duration: ${durationMin} min`
                          : "In Progress"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
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
    </div>
  );
}
