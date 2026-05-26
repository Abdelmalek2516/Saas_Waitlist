import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// DM Sans — rounded terminals, warm and approachable, widely used in modern SaaS
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Get Early Access — Join the Waitlist",
  description:
    "Sign up for early access and share your referral link to move up the waitlist. The more friends you refer, the sooner you're in.",
  openGraph: {
    title: "Get Early Access — Join the Waitlist",
    description:
      "Sign up for early access and share your referral link to move up the waitlist.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
