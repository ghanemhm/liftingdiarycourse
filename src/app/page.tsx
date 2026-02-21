import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] text-center px-6">
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        Your lifting diary.
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-10">
        Log workouts, track sets and reps, and watch your progress over time.
      </p>
      <div className="flex gap-3">
        <SignUpButton mode="modal">
          <Button size="lg">Get started</Button>
        </SignUpButton>
        <SignInButton mode="modal">
          <Button size="lg" variant="outline">
            Sign in
          </Button>
        </SignInButton>
      </div>
    </main>
  );
}
