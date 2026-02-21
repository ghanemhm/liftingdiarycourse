import { db } from '@/db'
import { exercises, workoutExercises, sets, workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

// ---------------------------------------------------------------------------
// Read helpers — call auth() internally, enforce userId isolation
// ---------------------------------------------------------------------------

/** Global exercise catalog — no user filter needed. */
export async function getExercises() {
  return db.select().from(exercises).orderBy(exercises.name)
}

/** Alias used by server actions. */
export const getAllExercisesHelper = getExercises

/**
 * Returns exercises (with their sets) for a given workout.
 * Verifies the workout belongs to the current user.
 */
export async function getWorkoutExercisesWithSets(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return _fetchWorkoutExercisesWithSets(workoutId, userId)
}

/** Alias used by server actions (userId already verified by the action). */
export async function getWorkoutExercisesWithSetsHelper(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return _fetchWorkoutExercisesWithSets(workoutId, userId)
}

async function _fetchWorkoutExercisesWithSets(workoutId: string, userId: string) {
  const rows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
      order: workoutExercises.order,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .leftJoin(sets, eq(workoutExercises.id, sets.workoutExerciseId))
    .where(
      and(
        eq(workoutExercises.workoutId, workoutId),
        eq(workouts.userId, userId)
      )
    )
    .orderBy(workoutExercises.order, sets.setNumber)

  const map = new Map<
    string,
    {
      id: string
      workoutId: string
      exerciseId: string
      order: number
      exercise: { id: string; name: string }
      sets: { id: string; setNumber: number; weight: string | null; reps: number | null }[]
    }
  >()

  for (const row of rows) {
    if (!map.has(row.workoutExerciseId)) {
      map.set(row.workoutExerciseId, {
        id: row.workoutExerciseId,
        workoutId: row.workoutId,
        exerciseId: row.exerciseId,
        order: row.order,
        exercise: { id: row.exerciseId, name: row.exerciseName },
        sets: [],
      })
    }
    if (row.setId) {
      map.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        weight: row.weight,
        reps: row.reps,
      })
    }
  }

  return Array.from(map.values())
}

// ---------------------------------------------------------------------------
// Mutation helpers — used by server actions
// ---------------------------------------------------------------------------

export async function addExerciseToWorkoutHelper(
  workoutId: string,
  exerciseId: string,
  order: number
) {
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning()
  return workoutExercise
}

export async function removeExerciseFromWorkoutHelper(workoutExerciseId: string) {
  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
}
