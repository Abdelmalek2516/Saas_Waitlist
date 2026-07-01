import { cookies } from "next/headers";
import Script from "next/script";
import { Clock, Lock, Shield, Sparkles } from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";
import { WaitlistForm } from "@/components/WaitlistForm";
import { ReferralHub } from "@/components/ReferralHub";

const AVATAR_GRADIENTS = [
  "from-sky-400 to-blue-500",
  "from-blue-400 to-indigo-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-blue-600",
  "from-sky-300 to-cyan-500",
];

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default async function Home() {
  const cookieStore = await cookies();
  const waitlistRef = cookieStore.get("waitlist_ref")?.value;

  let existingUser = null;
  let position = 0;
  let totalSignups = 0;

  if (waitlistRef) {
    await dbConnect();
    existingUser = await User.findOne({ referralCode: waitlistRef });
    if (existingUser) {
      [position, totalSignups] = await Promise.all([
        User.countDocuments({ createdAt: { $lt: existingUser.createdAt } }).then((c) => c + 1),
        User.countDocuments(),
      ]);
    }
  }

  return (
    <>
      {/* Load Turnstile script only when the site key is configured */}
      {TURNSTILE_SITE_KEY && !existingUser && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="lazyOnload"
        />
      )}
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
            <form action={async () => {
              "use server";
              const cookieStore = await cookies();
              cookieStore.delete("waitlist_ref");
            }}>
              <button type="submit" className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 outline-none">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm shadow-blue-200">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold tracking-tight text-slate-800">
                  LaunchKit
                </span>
              </button>
            </form>
            {/* The sign up / sign in buttons have been removed. Login is strictly for /admin now. */}
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

            {/* Form or Status */}
            {existingUser ? (
              <ReferralHub
                referralCode={existingUser.referralCode}
                position={position}
                totalSignups={totalSignups}
              />
            ) : (
              <WaitlistForm />
            )}

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
    </>
  );
}