"use client";

import { Suspense, useActionState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { joinWaitlist } from "@/actions/waitlist";
import { ReferralHub } from "@/components/ReferralHub";

// Cloudflare Turnstile global types
declare global {
  interface Window {
    turnstile?: { reset: (selector?: string) => void };
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function WaitlistFormInner() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [state, formAction, isPending] = useActionState(joinWaitlist, null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.referralCode) inputRef.current?.focus();
  }, [state?.referralCode]);

  useEffect(() => {
    if (state?.error && TURNSTILE_SITE_KEY) {
      window.turnstile?.reset(".cf-turnstile");
    }
  }, [state?.error]);

  if (state?.referralCode) {
    return (
      <ReferralHub
        referralCode={state.referralCode}
        position={state.position ?? 1}
        totalSignups={state.totalSignups ?? 1}
      />
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="ref" value={refCode} />
      <input
        type="text"
        name="secondary_email_confirm"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          id="email"
          type="email"
          name="email"
          placeholder="name@example.com"
          required
          disabled={isPending}
          className="flex-1 rounded-none border--200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-md shadow-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-400/40 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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

      {TURNSTILE_SITE_KEY && (
        <div className="flex justify-center pt-1">
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="light" data-size="normal" />
        </div>
      )}

      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm text-red-500">
          <span className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">
            !
          </span>
          {state.error}
        </p>
      )}

      <p className="pt-1 text-center text-xs text-slate-400">
        Join <span className="font-semibold text-slate-600">2,400+</span> others already on the list. No spam — ever.
      </p>
    </form>
  );
}

export function WaitlistForm() {
  return (
    <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-white/60" />}>
      <WaitlistFormInner />
    </Suspense>
  );
}
