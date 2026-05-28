import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  LogOut,
  MailCheck,
  Sparkles,
  Users,
} from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";
import { UserButton } from "@clerk/nextjs";

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ── Page (Server Component) ───────────────────────────────────────────────────
export default async function DashboardPage() {
  // 1. Get the authenticated Clerk user (middleware already ensured auth)
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) redirect("/sign-in");

  // 2. Look up their waitlist record by email
  await dbConnect();
  const waitlistUser = await User.findOne({ email });

  // 3. If they signed into Clerk but never joined the waitlist, redirect home
  if (!waitlistUser) {
    redirect("/?not_on_waitlist=1");
  }

  // 4. Calculate live position and total (parallel queries)
  const [position, totalSignups] = await Promise.all([
    User.countDocuments({ createdAt: { $lt: waitlistUser.createdAt } }).then(
      (c) => c + 1,
    ),
    User.countDocuments(),
  ]);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
            <span className="text-sm text-slate-500">
              {clerkUser.firstName ?? email}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-5">

          {/* Welcome */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Your waitlist status
            </h1>
            <p className="mt-1 text-sm text-slate-500">{email}</p>
          </div>

          {/* ── Position card ── */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-6 shadow-sm">

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

            {/* Big rank */}
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
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
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

            {/* Share buttons — client interactions, so we use plain links/buttons */}
            <div className="grid grid-cols-3 gap-2">
              {/* Copy is client-side; we render it as a link that JS will enhance */}
              <a
                id="copy-referral-link"
                href={referralLink}
                data-link={referralLink}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  void navigator.clipboard.writeText(
                    (e.currentTarget as HTMLAnchorElement).dataset.link ?? "",
                  );
                  const el = e.currentTarget as HTMLAnchorElement;
                  const orig = el.textContent;
                  el.textContent = "✓ Copied!";
                  setTimeout(() => {
                    el.textContent = orig;
                  }, 2000);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextX)}&url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900"
              >
                <XIcon />
                Share
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareTextWA)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700 transition-all duration-200 hover:bg-green-100"
              >
                <WhatsAppIcon />
                Share
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Each referral that signs up moves you one spot closer to the front.
          </p>
        </div>
      </main>
    </div>
  );
}
