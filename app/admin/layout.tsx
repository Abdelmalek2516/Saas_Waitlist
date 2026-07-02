import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

const getAdminEmails = () =>
  (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  if (!getAdminEmails().includes(email)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-slate-50">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
            <p className="text-sm text-slate-500">
              The email <span className="font-semibold text-slate-800">{email}</span> is not authorized to access the admin dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <SignOutButton>
              <button className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors">
                Sign out
              </button>
            </SignOutButton>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
