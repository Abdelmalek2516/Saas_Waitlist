import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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
    // Authenticated but not an admin — send them to their own dashboard
    redirect("/dashboard");
  }

  return <>{children}</>;
}
