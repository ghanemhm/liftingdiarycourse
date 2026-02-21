import { getWorkout } from '@/data/workouts';
import { getWorkoutExercisesWithSets, getExercises } from '@/data/exercises';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { WorkoutDetailClient } from './workout-detail-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { workoutId } = await params;

  const [workout, exercisesWithSets, allExercises] = await Promise.all([
    getWorkout(workoutId),
    getWorkoutExercisesWithSets(workoutId),
    getExercises(),
  ]);

  if (!workout) notFound();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{workout.name}</h1>
          <p className="text-muted-foreground mt-1">
            {format(workout.startedAt, 'do MMM yyyy')} •{' '}
            {workout.completedAt ? 'Completed' : 'In Progress'}
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <WorkoutDetailClient
        workout={workout}
        exercisesWithSets={exercisesWithSets}
        allExercises={allExercises}
      />
    </div>
  );
}
