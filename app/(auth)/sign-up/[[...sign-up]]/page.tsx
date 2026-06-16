import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const appearance = {
  variables: {
    colorPrimary: "#0284c7",
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
    footer: "hidden",
    card: "shadow-xl border border-blue-100 bg-white/95 !rounded-2xl",
    formButtonPrimary:
      "bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md font-semibold",
    socialButtonsBlockButton:
      "border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-medium",
    formFieldInput:
      "border-slate-200 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100",
    dividerText: "text-slate-400 text-xs",
  },
};

export default function SignUpPage() {
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

      <SignUp appearance={appearance} />

      {/* Manual footer */}
      <p className="text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-sky-600 hover:text-sky-700"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
