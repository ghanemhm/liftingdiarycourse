import { db } from '@/db'
import { sets, workoutExercises, workouts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

// ---------------------------------------------------------------------------
// Read helpers — call auth() internally, enforce userId isolation
// ---------------------------------------------------------------------------

/** Returns all sets for a workout exercise, verifying workout ownership. */
export async function getSets(workoutExerciseId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return db
    .select({
      id: sets.id,
      setNumber: sets.setNumber,
      weight: sets.weight,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(sets.workoutExerciseId, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )
    .orderBy(sets.setNumber)
}

// ---------------------------------------------------------------------------
// Mutation helpers — used by server actions
// ---------------------------------------------------------------------------

export async function addSetHelper(data: {
  workoutExerciseId: string
  setNumber: number
  weight?: string
  reps?: number
}) {
  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId: data.workoutExerciseId,
      setNumber: data.setNumber,
      weight: data.weight ?? null,
      reps: data.reps ?? null,
    })
    .returning()
  return set
}

export async function updateSetHelper(
  setId: string,
  data: { weight?: string; reps?: number }
) {
  const [set] = await db
    .update(sets)
    .set({
      weight: data.weight !== undefined ? data.weight : undefined,
      reps: data.reps !== undefined ? data.reps : undefined,
    })
    .where(eq(sets.id, setId))
    .returning()
  return set
}

export async function deleteSetHelper(setId: string) {
  await db.delete(sets).where(eq(sets.id, setId))
}
