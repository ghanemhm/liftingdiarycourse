import { db } from '@/db'
import { workouts } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

/**
 * Returns workouts for the current user, optionally filtered to a single day.
 */
export async function getUserWorkouts(date?: Date) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const rows = await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.startedAt))

  if (!date) return rows

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return rows.filter((w) => w.startedAt >= start && w.startedAt <= end)
}
