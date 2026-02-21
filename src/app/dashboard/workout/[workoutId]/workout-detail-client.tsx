'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  logSet,
  deleteSet,
  completeWorkout,
} from './actions';

type SetRow = {
  id: string;
  setNumber: number;
  weight: string | null;
  reps: number | null;
};

type WorkoutExercise = {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  exercise: { id: string; name: string };
  sets: SetRow[];
};

type Workout = {
  id: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
};

type Exercise = {
  id: string;
  name: string;
};

interface WorkoutDetailClientProps {
  workout: Workout;
  exercisesWithSets: WorkoutExercise[];
  allExercises: Exercise[];
}

export function WorkoutDetailClient({
  workout,
  exercisesWithSets,
  allExercises,
}: WorkoutDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const isCompleted = !!workout.completedAt;

  const refresh = () => startTransition(() => router.refresh());

  const handleAddExercise = async () => {
    if (!selectedExerciseId) return;
    const result = await addExerciseToWorkout({
      workoutId: workout.id,
      exerciseId: selectedExerciseId,
    });
    if (result.success) {
      setAddExerciseOpen(false);
      setSelectedExerciseId('');
      refresh();
    } else {
      setError(typeof result.errors === 'string' ? result.errors : 'Failed to add exercise');
    }
  };

  const handleRemoveExercise = async (workoutExerciseId: string) => {
    const result = await removeExerciseFromWorkout({
      workoutId: workout.id,
      workoutExerciseId,
    });
    if (result.success) {
      refresh();
    } else {
      setError(typeof result.errors === 'string' ? result.errors : 'Failed to remove exercise');
    }
  };

  const handleLogSet = async (
    workoutExerciseId: string,
    setId: string | undefined,
    weight: string,
    reps: string
  ) => {
    const result = await logSet({
      workoutId: workout.id,
      workoutExerciseId,
      setId,
      weight: weight || undefined,
      reps: reps ? parseInt(reps) : undefined,
    });
    if (result.success) {
      refresh();
    } else {
      setError(typeof result.errors === 'string' ? result.errors : 'Failed to log set');
    }
  };

  const handleDeleteSet = async (setId: string) => {
    const result = await deleteSet({ workoutId: workout.id, setId });
    if (result.success) {
      refresh();
    } else {
      setError(typeof result.errors === 'string' ? result.errors : 'Failed to delete set');
    }
  };

  const handleCompleteWorkout = async () => {
    const result = await completeWorkout({ workoutId: workout.id });
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(typeof result.errors === 'string' ? result.errors : 'Failed to complete workout');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isCompleted && (
        <div className="flex justify-end">
          <Button onClick={handleCompleteWorkout} disabled={isPending}>
            Complete Workout
          </Button>
        </div>
      )}

      {exercisesWithSets.map((workoutExercise) => (
        <ExerciseCard
          key={workoutExercise.id}
          workoutExercise={workoutExercise}
          isCompleted={isCompleted}
          isPending={isPending}
          onRemove={() => handleRemoveExercise(workoutExercise.id)}
          onLogSet={handleLogSet}
          onDeleteSet={handleDeleteSet}
        />
      ))}

      {!isCompleted && (
        <Dialog open={addExerciseOpen} onOpenChange={setAddExerciseOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isPending}>
              + Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
              <DialogDescription>
                Select an exercise to add to your workout
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {allExercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleAddExercise} disabled={!selectedExerciseId || isPending}>
                  Add Exercise
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddExerciseOpen(false);
                    setSelectedExerciseId('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise;
  isCompleted: boolean;
  isPending: boolean;
  onRemove: () => void;
  onLogSet: (
    workoutExerciseId: string,
    setId: string | undefined,
    weight: string,
    reps: string
  ) => void;
  onDeleteSet: (setId: string) => void;
}

function ExerciseCard({
  workoutExercise,
  isCompleted,
  isPending,
  onRemove,
  onLogSet,
  onDeleteSet,
}: ExerciseCardProps) {
  const [newWeight, setNewWeight] = useState('');
  const [newReps, setNewReps] = useState('');
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');

  const handleAddSet = async () => {
    await onLogSet(workoutExercise.id, undefined, newWeight, newReps);
    setNewWeight('');
    setNewReps('');
  };

  const handleSaveEdit = async (setId: string) => {
    await onLogSet(workoutExercise.id, setId, editWeight, editReps);
    setEditingSetId(null);
  };

  const startEditing = (set: SetRow) => {
    setEditingSetId(set.id);
    setEditWeight(set.weight ?? '');
    setEditReps(set.reps?.toString() ?? '');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{workoutExercise.exercise.name}</CardTitle>
          {!isCompleted && (
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={isPending}>
              Remove
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Set</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Reps</TableHead>
              {!isCompleted && <TableHead className="w-28">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {workoutExercise.sets.map((set) => (
              <TableRow key={set.id}>
                <TableCell>{set.setNumber}</TableCell>
                <TableCell>
                  {editingSetId === set.id ? (
                    <Input
                      type="text"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      placeholder="Weight"
                      className="w-24"
                    />
                  ) : (
                    set.weight ?? '—'
                  )}
                </TableCell>
                <TableCell>
                  {editingSetId === set.id ? (
                    <Input
                      type="number"
                      value={editReps}
                      onChange={(e) => setEditReps(e.target.value)}
                      placeholder="Reps"
                      className="w-24"
                    />
                  ) : (
                    set.reps ?? '—'
                  )}
                </TableCell>
                {!isCompleted && (
                  <TableCell>
                    {editingSetId === set.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSaveEdit(set.id)}
                          disabled={isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingSetId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditing(set)}
                          disabled={isPending}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteSet(set.id)}
                          disabled={isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!isCompleted && (
              <TableRow>
                <TableCell>{workoutExercise.sets.length + 1}</TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="Weight"
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={newReps}
                    onChange={(e) => setNewReps(e.target.value)}
                    placeholder="Reps"
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={handleAddSet} disabled={isPending}>
                    Add Set
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
