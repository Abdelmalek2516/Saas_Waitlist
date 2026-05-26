"use server";

import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";

// Zod schema — email is required, referralCode (the ref param) is optional
const waitlistSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address." }),
  referralCode: z.string().optional(),
});

export async function joinWaitlist(prevState: unknown, formData: FormData) {
  const rawEmail = formData.get("email");
  const rawRef = formData.get("ref"); // optional referral code from the URL

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

    // Check for duplicate email up-front for a fast, friendly error
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "This email is already on the waitlist!" };
    }

    // Validate the referral code if one was provided
    let referrer = null;
    if (incomingRef) {
      referrer = await User.findOne({ referralCode: incomingRef });
      // If the code doesn't match anyone we simply ignore it — no hard failure
    }

    // Generate a unique referral code for the new user (retry on collision)
    let newReferralCode: string | null = null;
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const candidate = crypto.randomBytes(4).toString("hex").slice(0, 6);
      try {
        await User.create({
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
          continue; // try a new code
        }
        throw err;
      }
    }

    if (!newReferralCode) {
      return {
        error: "We couldn't create your referral code. Please try again.",
      };
    }

    // Atomically increment the referrer's count now that the signup succeeded
    if (referrer) {
      await User.findByIdAndUpdate(referrer._id, {
        $inc: { referralCount: 1 },
      });
    }

    return {
      success: "You're on the list! Share your link to move up.",
      referralCode: newReferralCode,
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