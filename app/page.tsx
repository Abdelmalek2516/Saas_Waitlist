"use client";

import { Suspense, useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Clock,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { joinWaitlist } from "@/actions/waitlist";
import { ReferralHub } from "@/components/ReferralHub";

// ── Auth-aware nav actions ────────────────────────────────────────────────────
function NavActions() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-100" />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-800"
        >
          My position
        </Link>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/sign-in"
        className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-800"
      >
        Sign in
      </Link>
      <a
        href="#email"
        className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800"
      >
        Sign up
      </a>
    </div>
  );
}

// ── Avatar colours ────────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-blue-400 to-indigo-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-blue-600",
  "from-sky-300 to-cyan-500",
];

// ── Waitlist form (needs Suspense for useSearchParams) ────────────────────────
// Responsibility: collect the email, submit to the server action, and hand off
// to ReferralHub once we have a referral code back. Nothing else.
function WaitlistForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [state, formAction, isPending] = useActionState(joinWaitlist, null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.referralCode) inputRef.current?.focus();
  }, [state?.referralCode]);

  // ── Post-signup: hand off entirely to ReferralHub ────────────────────────
  if (state?.referralCode) {
    return (
      <ReferralHub
        referralCode={state.referralCode}
        position={state.position ?? 1}
        totalSignups={state.totalSignups ?? 1}
      />
    );
  }

  // ── Pre-signup: just the email form ──────────────────────────────────────
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="ref" value={refCode} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          required
          disabled={isPending}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-md shadow-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/40 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Joining…
            </>
          ) : (
            <>
              Get Early Access
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <span className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">
            !
          </span>
          {state.error}
        </p>
      )}

      <p className="pt-1 text-center text-xs text-slate-400">
        Join{" "}
        <span className="font-semibold text-slate-600">2,400+</span> others
        already on the list. No spam — ever.
      </p>
    </form>
  );
}

// ── Page shell ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{
        background: `
          radial-gradient(ellipse 80% 70% at 0% 0%, #bfdbfe 0%, transparent 65%),
          radial-gradient(ellipse 60% 55% at 100% 5%, #e0f2fe 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 50% 100%, #dbeafe 0%, transparent 70%),
          #ffffff
        `,
      }}
    >
      {/* ── Sticky top nav ── */}
      <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm shadow-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-800">
              LaunchKit
            </span>
          </div>
          <NavActions />
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg space-y-8 text-center">

          {/* Sparkle icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-200/60">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Join the waitlist for{" "}
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                LaunchKit
              </span>
            </h1>
            <p className="mx-auto max-w-sm text-base leading-relaxed text-slate-500">
              Get early access before anyone else. Refer friends to move up the
              list and be first through the door.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {AVATAR_GRADIENTS.map((gradient, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br ${gradient} shadow-sm`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">2,400+</span>{" "}
              people already on the list
            </p>
          </div>

          {/* Form */}
          <Suspense
            fallback={
              <div className="h-12 animate-pulse rounded-xl bg-white/60" />
            }
          >
            <WaitlistForm />
          </Suspense>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              No spam, ever
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Your data is safe
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Unsubscribe anytime
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}