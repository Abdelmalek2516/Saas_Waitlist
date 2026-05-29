import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MailCheck, Sparkles, Users } from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";
import { UserButton } from "@clerk/nextjs";
import { ShareButtons } from "./ShareButtons";

// ── Page (Server Component) ───────────────────────────────────────────────────
export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  await dbConnect();
  const waitlistUser = await User.findOne({ email });

  // ── Not on waitlist ───────────────────────────────────────────────────────
  if (!waitlistUser) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{
          background: `
            radial-gradient(ellipse 80% 70% at 0% 0%, #bfdbfe 0%, transparent 65%),
            radial-gradient(ellipse 60% 55% at 100% 5%, #e0f2fe 0%, transparent 60%),
            #ffffff
          `,
        }}
      >
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-blue-200/60">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            You&apos;re not on the waitlist yet
          </h1>
          <p className="text-sm text-slate-500">
            We couldn&apos;t find a waitlist entry for{" "}
            <span className="font-semibold text-slate-700">{email}</span>.
            Join the waitlist first, then come back here to track your position.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800"
          >
            Join the waitlist →
          </Link>
        </div>
      </div>
    );
  }

  // ── On waitlist — calculate live position ─────────────────────────────────
  const [position, totalSignups] = await Promise.all([
    User.countDocuments({ createdAt: { $lt: waitlistUser.createdAt } }).then(
      (c) => c + 1,
    ),
    User.countDocuments(),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const referralLink = `${appUrl}/?ref=${waitlistUser.referralCode}`;

  const aheadPct =
    totalSignups > 1
      ? Math.round(((totalSignups - position) / totalSignups) * 100)
      : 0;

  const MILESTONES = [50, 100, 250, 500, 1000, 2000];
  const nextMilestone = MILESTONES.find((m) => m < position) ?? null;
  const spotsNeeded = nextMilestone ? position - nextMilestone : null;

  const shareTextX = `I'm #${position} on the waitlist 🚀 Join me:`;
  const shareTextWA = `I'm #${position} on the waitlist! Join with my link: ${referralLink}`;

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
      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm shadow-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-800">
              LaunchKit
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {clerkUser.firstName ?? email}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-5">

          {/* Welcome heading */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Your waitlist status
            </h1>
            <p className="mt-1 text-sm text-slate-500">{email}</p>
          </div>

          {/* ── Position card ── */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-6 shadow-sm">

            {/* Header row */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50">
                  <MailCheck className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  You&apos;re on the list!
                </span>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
                {waitlistUser.status}
              </span>
            </div>

            {/* Big rank number */}
            <div className="mb-4 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                Current position
              </p>
              <p className="mt-1 bg-gradient-to-br from-sky-500 to-blue-700 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
                #{position.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                out of{" "}
                <span className="font-semibold text-slate-700">
                  {totalSignups.toLocaleString()}
                </span>{" "}
                people on the list
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Ahead of others</span>
                <span className="font-semibold text-sky-600">{aheadPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(aheadPct, 2)}%` }}
                />
              </div>
            </div>

            {/* Referral count */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">
                <span className="font-bold text-slate-800">
                  {waitlistUser.referralCount}
                </span>{" "}
                successful referral{waitlistUser.referralCount !== 1 ? "s" : ""}{" "}
                so far
              </span>
            </div>

            {/* Milestone nudge */}
            {spotsNeeded !== null && nextMilestone !== null && (
              <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-center text-xs text-sky-700">
                🎯 Refer{" "}
                <span className="font-bold">{spotsNeeded}</span>{" "}
                more friend{spotsNeeded !== 1 ? "s" : ""} to break into the top{" "}
                <span className="font-bold">{nextMilestone}</span>
              </p>
            )}
          </div>

          {/* ── Referral link ── */}
          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Your referral link
            </p>
            <p className="break-all font-mono text-sm text-slate-600">
              {referralLink}
            </p>

            {/* Client Component handles all interactive share buttons */}
            <ShareButtons
              referralLink={referralLink}
              shareTextX={shareTextX}
              shareTextWA={shareTextWA}
            />
          </div>

          <p className="text-center text-xs text-slate-400">
            Each referral that signs up moves you one spot closer to the front.
          </p>
        </div>
      </main>
    </div>
  );
}
