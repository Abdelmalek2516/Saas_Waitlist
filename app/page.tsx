"use client";

import { Suspense, useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Lock,
  MailCheck,
  Shield,
  Sparkles,
} from "lucide-react";
import { joinWaitlist } from "@/actions/waitlist";

// ── Avatar colours (full strings so Tailwind includes them) ──────────────────
const AVATAR_GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-blue-400 to-indigo-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-blue-600",
  "from-sky-300 to-cyan-500",
];

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── X (Twitter) icon ──────────────────────────────────────────────────────────
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ── Inner form (needs Suspense for useSearchParams) ────────────────────────────
function WaitlistForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";

  const [state, formAction, isPending] = useActionState(joinWaitlist, null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.referralCode) inputRef.current?.focus();
  }, [state?.referralCode]);

  const referralLink = state?.referralCode
    ? `${window.location.origin}/?ref=${state.referralCode}`
    : null;

  function handleCopy() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleShareX() {
    if (!referralLink) return;
    const text = `Join me on the waitlist:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleShareWhatsApp() {
    if (!referralLink) return;
    const text = `join the waitlist with me!: ${referralLink}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  // ── Post-signup: referral hub ────────────────────────────────────────────────
  if (state?.referralCode && referralLink) {
    return (
      <div className="space-y-5 animate-fade-in-up">
        {/* Success header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50">
            <MailCheck className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">You&apos;re on the list!</p>
            <p className="text-sm text-slate-500">
              Share your link below to move up faster
            </p>
          </div>
        </div>

        {/* Referral link box */}
        <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Your referral link
          </p>
          <p className="break-all font-mono text-sm text-slate-600">
            {referralLink}
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={handleShareX}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
            >
              <XIcon />
              Share
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
            >
              <WhatsAppIcon />
              Share
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Every person who joins through your link moves you closer to the front.
        </p>
      </div>
    );
  }

  // ── Default signup form ──────────────────────────────────────────────────────
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
      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm shadow-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-800">
              LaunchKit
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-800"
            >
              Sign in
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800"
            >
              Sign up
            </a>
          </div>
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

          {/* Form — no card, floats directly on the gradient */}
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