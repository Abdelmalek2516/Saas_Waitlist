"use client";

import { useEffect, useState } from "react";
import { Bookmark, MailCheck } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";

interface ReferralHubProps {
  referralCode: string;
  position: number;
  totalSignups: number;
}

const MILESTONES = [50, 100, 250, 500, 1000, 2000];

export function ReferralHub({
  referralCode,
  position,
  totalSignups,
}: ReferralHubProps) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const referralLink = origin ? `${origin}/?ref=${referralCode}` : "";
  const statusUrl = origin ? `${origin}/status/${referralCode}` : "";

  const aheadPct =
    totalSignups > 1
      ? Math.round(((totalSignups - position) / totalSignups) * 100)
      : 0;

  const nextMilestone = MILESTONES.find((m) => m < position) ?? null;
  const spotsNeeded = nextMilestone ? position - nextMilestone : null;

  const shareTextX = `I just secured my spot on the waitlist 🚀 Join me:`;
  const shareTextWA = `I just joined the waitlist! Get early access: ${referralLink}`;

  return (
    <div className="space-y-4 animate-fade-in-up">

      {/* ── Position card ── */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-5 shadow-sm">

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
          <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            Waitlisted
          </span>
        </div>

        {/* Big rank number */}
        <div className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            Your position
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

        {/* Milestone nudge */}
        {spotsNeeded !== null && nextMilestone !== null && (
          <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-center text-xs text-sky-700">
            🎯 Refer{" "}
            <span className="font-bold">{spotsNeeded}</span>{" "}
            friend{spotsNeeded !== 1 ? "s" : ""} to break into the top{" "}
            <span className="font-bold">{nextMilestone}</span>
          </p>
        )}
      </div>

      {/* ── Referral link box ── */}
      <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          Your referral link
        </p>
        <p className="break-all font-mono text-sm text-slate-600">
          {referralLink}
        </p>
        <ShareButtons
          referralLink={referralLink}
          shareTextX={shareTextX}
          shareTextWA={shareTextWA}
        />
      </div>

      <p className="text-center text-xs text-slate-400">
        Every referral that signs up moves you one spot closer to the front.
      </p>

      {/* ── Status page (bookmarkable) ── */}
      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Your status page
          </p>
        </div>
        <p className="break-all font-mono text-xs text-slate-500">
          {statusUrl}
        </p>
        <ShareButtons
          referralLink={statusUrl}
          shareTextX={`Check my waitlist position — I'm #${position}:`}
          shareTextWA={`Check my LaunchKit waitlist position: ${statusUrl}`}
        />
      </div>

    </div>
  );
}
