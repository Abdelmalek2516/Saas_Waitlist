"use server";

import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";

const waitlistSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address." }),
  referralCode: z.string().optional(),
});

export async function joinWaitlist(prevState: unknown, formData: FormData) {
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

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "This email is already on the waitlist!" };
    }

    let referrer = null;
    if (incomingRef) {
      referrer = await User.findOne({ referralCode: incomingRef });
    }

    // Create the new user — keep a reference to the document so we can
    // use its createdAt timestamp for the position query below.
    let newUser: Awaited<ReturnType<typeof User.create>> | null = null;
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

    // Increment referrer's count atomically
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

    // ── Waitlist position ────────────────────────────────────────────────────
    // Run both queries in parallel: position = users who signed up before
    // this one (by createdAt) + 1; totalSignups = full collection count.
    const [position, totalSignups] = await Promise.all([
      User.countDocuments({ createdAt: { $lt: newUser.createdAt } }).then(
        (c) => c + 1,
      ),
      User.countDocuments(),
    ]);

    return {
      success: "You're on the list!",
      referralCode: newReferralCode,
      position,
      totalSignups,
    };
  } catch (error: unknown) {
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