"use client";

import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { joinWaitlist } from "@/actions/waitlist";
import { Button } from "@/components/ui/button";

// ─── Inner component that uses useSearchParams ────────────────────────────────
// Must be wrapped in <Suspense> because useSearchParams() opts the page into
// dynamic rendering and Next.js requires a boundary for it.
function WaitlistForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [state, formAction, isPending] = useActionState(joinWaitlist, null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const referralLink =
    state?.referralCode
      ? `${window.location.origin}/?ref=${state.referralCode}`
      : null;

  function handleCopy() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Join the Waitlist
        </h1>
        <p className="text-slate-500">
          Enter your email to get early access. Refer friends to move up the
          list faster.
        </p>
      </div>

      {/* Signup form — only shown before success */}
      {!state?.referralCode && (
        <form action={formAction} className="space-y-4">
          {/* Hidden field carries the referral code through the form submission */}
          <input type="hidden" name="ref" value={refCode} />

          <input
            ref={inputRef}
            type="email"
            name="email"
            placeholder="name@example.com"
            required
            disabled={isPending}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm
                       text-slate-900 placeholder:text-slate-400 shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-slate-400
                       disabled:cursor-not-allowed disabled:opacity-50"
          />

          {state?.error && (
            <p className="text-sm text-red-500 font-medium">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Joining…" : "Join Now"}
          </Button>
        </form>
      )}

      {/* Post-signup: show the user's referral link */}
      {state?.referralCode && (
        <div className="space-y-4">
          <p className="text-sm text-green-600 font-medium text-center">
            {state.success}
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your referral link
            </p>
            <p className="text-sm text-slate-800 break-all font-mono">
              {referralLink}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleCopy}
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </Button>
          </div>

          <p className="text-center text-xs text-slate-400">
            Share this link — every successful referral moves you up the list.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center text-slate-400 text-sm">
            Loading…
          </div>
        }
      >
        <WaitlistForm />
      </Suspense>
    </main>
  );
}