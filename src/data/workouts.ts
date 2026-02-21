import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

// ---------------------------------------------------------------------------
// Read helpers — call auth() internally, enforce userId isolation
// ---------------------------------------------------------------------------

export async function getWorkouts() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.startedAt))
}

export async function getWorkout(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))

  return workout ?? null
}

// ---------------------------------------------------------------------------
// Mutation helpers — userId passed by the calling server action
// ---------------------------------------------------------------------------

export async function createWorkoutHelper(data: {
  name: string
  startedAt: Date
  userId: string
}) {
  const [workout] = await db
    .insert(workouts)
    .values({ name: data.name, startedAt: data.startedAt, userId: data.userId })
    .returning()
  return workout
}

export async function getWorkoutByIdHelper(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
  return workout ?? null
}

export async function completeWorkoutHelper(workoutId: string, userId: string) {
  const [workout] = await db
    .update(workouts)
    .set({ completedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
  return workout
}

export async function updateWorkoutHelper(
  workoutId: string,
  userId: string,
  data: { name?: string; startedAt?: Date }
) {
  const [workout] = await db
    .update(workouts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
  return workout
}
