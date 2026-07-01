"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import mongoose, { HydratedDocument } from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/db";
import { getClientIp } from "@/lib/getClientIp";
import User, { IUser } from "@/models/Users.model";
import RateLimit from "@/models/RateLimit.model";

// ── Constants ──────────────────────────────────────────────────────────────────
const RATE_LIMIT_MAX = 5;           // max attempts
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// ── Input schema ──────────────────────────────────────────────────────────────
const waitlistSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address." }),
  referralCode: z.string().optional(),
});

// ── GDPR-safe IP hashing ─────────────────────────────────────────────────────
// We never store raw IPs. sha256(ip + salt) is irreversible.
function hashIp(ip: string): string {
  const salt = process.env.IP_SALT ?? "default-dev-salt-change-in-prod";
  return crypto.createHash("sha256").update(ip + salt).digest("hex");
}

// ── Cloudflare Turnstile server-side verification ────────────────────────────
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  // If no key is configured (e.g., local dev) we skip verification.
  if (!secretKey) return true;
  // Empty token when key is configured = reject immediately.
  if (!token) return false;

  try {
    const resp = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretKey, response: token }),
      },
    );
    const data = (await resp.json()) as { success: boolean };
    return data.success === true;
  } catch {
    // Network failure: fail open so a Cloudflare outage doesn't brick signups.
    return true;
  }
}

// ── Atomic rate-limiter ───────────────────────────────────────────────────────
// Uses a single findOneAndUpdate($inc) to avoid any check-then-act race condition.
// Simultaneous bot requests all see the incremented counter, not the stale zero.
async function checkRateLimit(ipHash: string): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  const record = await RateLimit.findOneAndUpdate(
    { ipHash, action: "waitlist" },
    {
      $inc: { count: 1 },
      // Only set expiresAt on document creation so the window doesn't reset.
      $setOnInsert: { expiresAt },
    },
    { upsert: true, new: true },
  );

  return record.count <= RATE_LIMIT_MAX;
}

// ── Main action ───────────────────────────────────────────────────────────────
export async function joinWaitlist(prevState: unknown, formData: FormData) {
  // ── 1. Honeypot check ──────────────────────────────────────────────────────
  // Real users never fill this field; bots scraping the DOM will.
  // The field is named to trick autofill-resistant scrapers but blocked from
  // browser autofill via tabIndex=-1, autoComplete=off, aria-hidden=true.
  const honeypot = formData.get("secondary_email_confirm");
  if (honeypot && String(honeypot).trim() !== "") {
    // Silently pretend success so bots don't know they were detected.
    return { error: "Something went wrong on our end. Please try again later." };
  }

  // ── 2. IP rate limiting (atomic, GDPR-safe) ────────────────────────────────
  const rawIp = await getClientIp();
  const ipHash = hashIp(rawIp);

  await dbConnect();
  const allowed = await checkRateLimit(ipHash);
  if (!allowed) {
    return {
      error: "Too many requests. Please wait 10 minutes before trying again.",
    };
  }

  // ── 3. Cloudflare Turnstile verification ───────────────────────────────────
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
  const turnstileOk = await verifyTurnstile(turnstileToken);
  if (!turnstileOk) {
    return { error: "Bot protection check failed. Please refresh and try again." };
  }

  // ── 4. Input validation ────────────────────────────────────────────────────
  const rawEmail = formData.get("email");
  const rawRef = formData.get("ref");

  const validatedFields = waitlistSchema.safeParse({
    email: rawEmail,
    referralCode: rawRef ?? undefined,
  });

  if (!validatedFields.success) {
    return {
      error:
        validatedFields.error.flatten().fieldErrors.email?.[0] ??
        "Invalid input.",
    };
  }

  const { email, referralCode: incomingRef } = validatedFields.data;

  // ── 5. Business logic ──────────────────────────────────────────────────────
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const [position, totalSignups] = await Promise.all([
        User.countDocuments({ createdAt: { $lt: existingUser.createdAt } }).then(
          (c) => c + 1,
        ),
        User.countDocuments(),
      ]);

      const cookieStore = await cookies();
      cookieStore.set("waitlist_ref", existingUser.referralCode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      return {
        success: "Welcome back! Here's your status.",
        referralCode: existingUser.referralCode,
        position,
        totalSignups,
      };
    }

    let referrer = null;
    if (incomingRef) {
      referrer = await User.findOne({ referralCode: incomingRef });
    }

    let newUser: HydratedDocument<IUser> | null = null;
    let newReferralCode: string | null = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = crypto.randomBytes(4).toString("hex").slice(0, 6);
      try {
        newUser = await User.create({
          email,
          referralCode: candidate,
          referredBy: referrer ? referrer.referralCode : undefined,
        });
        newReferralCode = candidate;
        break;
      } catch (err) {
        const mongoError = err as {
          code?: number;
          keyPattern?: Record<string, unknown>;
        };
        const isDuplicate = mongoError?.code === 11000;
        const isEmailDup = isDuplicate && Boolean(mongoError?.keyPattern?.email);
        const isRefDup =
          isDuplicate && Boolean(mongoError?.keyPattern?.referralCode);

        if (isEmailDup) {
          return { error: "This email is already on the waitlist!" };
        }
        if (isRefDup && attempt < maxAttempts - 1) {
          continue;
        }
        throw err;
      }
    }

    if (!newReferralCode || !newUser) {
      return {
        error: "We couldn't create your referral code. Please try again.",
      };
    }

    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

    const [position, totalSignups] = await Promise.all([
      User.countDocuments({ createdAt: { $lt: newUser.createdAt } }).then(
        (c) => c + 1,
      ),
      User.countDocuments(),
    ]);

    const cookieStore = await cookies();
    cookieStore.set("waitlist_ref", newReferralCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return {
      success: "You're on the list!",
      referralCode: newReferralCode,
      position,
      totalSignups,
    };
  } catch (error: unknown) {
    // Never expose internal error details to the client.
    console.error("Waitlist signup error:", error);

    if (error instanceof mongoose.Error.ValidationError) {
      return { error: "Please provide a valid email address." };
    }

    if (
      error instanceof mongoose.Error &&
      (error as Error).message.includes("buffering timed out")
    ) {
      return {
        error: "Database connection timed out. Please try again in a moment.",
      };
    }

    return { error: "Something went wrong on our end. Please try again later." };
  }
}