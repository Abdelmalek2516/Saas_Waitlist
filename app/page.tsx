"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";
import { Input } from "@base-ui/react/input";

export default function Home() {
  // useActionState manages the form submission lifecycle automatically
  // It gives us the current state (success/error messages) and an isPending flag
  const [state, formAction, isPending] = useActionState(joinWaitlist, null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Join the Waitlist
          </h1>
          <p className="text-slate-500">
            Enter your email to get early access to our platform.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <Input
              type="email"
              name="email"
              placeholder="name@example.com"
              required
              disabled={isPending}
            />
          </div>

          {/* Display feedback messages to the user */}
          {state?.error && (
            <p className="text-sm text-red-500 font-medium">{state.error}</p>
          )}
          {state?.success && (
            <p className="text-sm text-green-600 font-medium">{state.success}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Joining..." : "Join Now"}
          </Button>
        </form>

      </div>
    </main>
  );
}