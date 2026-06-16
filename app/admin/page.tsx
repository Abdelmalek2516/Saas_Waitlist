import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Sparkles, Users, TrendingUp, UserCheck } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";
import { StatusSelect } from "./StatusSelect";

// ── Status badge colours ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  waitlisted: "border-slate-200 bg-slate-100 text-slate-600",
  invited: "border-blue-200 bg-blue-100 text-blue-700",
  joined: "border-green-200 bg-green-100 text-green-700",
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminPage() {
  const clerkUser = await currentUser();
  const adminEmail = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  await dbConnect();

  // Parallel: all users + today's count + this week's count
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [allUsers, todayCount, weekCount] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).lean(),
    User.countDocuments({ createdAt: { $gte: todayStart } }),
    User.countDocuments({ createdAt: { $gte: weekStart } }),
  ]);

  const totalSignups = allUsers.length;

  // Top referrers (only those who referred at least 1 person)
  const topReferrers = [...allUsers]
    .filter((u) => u.referralCount > 0)
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-800">
                LaunchKit
              </span>
            </Link>
            <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {adminEmail}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Waitlist Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage signups, track referrals, and update user statuses.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total signups"
            value={totalSignups.toLocaleString()}
            icon={Users}
          />
          <StatCard
            label="New today"
            value={todayCount.toLocaleString()}
            icon={TrendingUp}
            sub={`${weekCount} this week`}
          />
          <StatCard
            label="Invited"
            value={allUsers
              .filter((u) => u.status === "invited")
              .length.toLocaleString()}
            icon={UserCheck}
            sub={`${allUsers.filter((u) => u.status === "joined").length} joined`}
          />
        </div>

        {/* ── Top referrers ── */}
        {topReferrers.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              🏆 Top Referrers
            </h2>
            <div className="space-y-2">
              {topReferrers.map((u, i) => (
                <div
                  key={String(u._id)}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700">{u.email}</span>
                  </div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                    {u.referralCount} referral{u.referralCount !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Users table ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-700">
              All users — {totalSignups.toLocaleString()} total
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Referrals</th>
                  <th className="px-4 py-3">Referred by</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allUsers.map((u, idx) => {
                  const rank = totalSignups - idx; // newest = highest rank number
                  const orderedRank = idx + 1; // position in chronological order
                  return (
                    <tr
                      key={String(u._id)}
                      className="transition-colors hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        #{orderedRank}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {u.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {u.referralCount > 0 ? (
                          <span className="font-semibold text-blue-600">
                            {u.referralCount}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        {u.referredBy ?? <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          userId={String(u._id)}
                          currentStatus={u.status as "waitlisted" | "invited" | "joined"}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
