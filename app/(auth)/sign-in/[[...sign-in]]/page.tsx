import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{
        background: `
          radial-gradient(ellipse 80% 70% at 0% 0%, #bfdbfe 0%, transparent 65%),
          radial-gradient(ellipse 60% 55% at 100% 5%, #e0f2fe 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 50% 100%, #dbeafe 0%, transparent 70%),
          #ffffff
        `,
      }}
    >
      <SignIn />
    </div>
  );
}
