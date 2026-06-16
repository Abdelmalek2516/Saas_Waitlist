import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const appearance = {
  variables: {
    colorPrimary: "#0284c7",           // sky-600
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorDanger: "#ef4444",
    fontFamily: '"DM Sans", system-ui, sans-serif',
    borderRadius: "0.75rem",
  },
  elements: {
    // Hide the "Secured by Clerk" footer entirely — we add our own link below
    footer: "hidden",
    // Card styling to match our design
    card: "shadow-xl border border-blue-100 bg-white/95 !rounded-2xl",
    // Primary button
    formButtonPrimary:
      "bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md font-semibold",
    // Social buttons
    socialButtonsBlockButton:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium",
    // Input fields
    formFieldInput:
      "border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100",
    // Divider text
    dividerText: "text-slate-400 text-xs",
  },
};

export default function SignInPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16"
      style={{
        background: `
          radial-gradient(ellipse 80% 70% at 0% 0%, #bfdbfe 0%, transparent 65%),
          radial-gradient(ellipse 60% 55% at 100% 5%, #e0f2fe 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 50% 100%, #dbeafe 0%, transparent 70%),
          #ffffff
        `,
      }}
    >
      {/* Back to home */}
      <Link
        href="/"
        className="flex items-center gap-2 self-start sm:self-auto"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-800">
          LaunchKit
        </span>
      </Link>

      <SignIn appearance={appearance} />

      {/* Manual footer — replaces the hidden Clerk one */}
      <p className="text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-sky-600 hover:text-sky-700"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
