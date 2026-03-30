"use server";

import { z } from "zod";
import  dbConnect  from "@/lib/db";
import User from "@/models/Users.model";

// 1. Zod Schema for validation
// We validate here so we can return friendly error messages before hitting the database
const waitlistSchema = z.object({
  email: z.string().email({ message: "Please provide a valid email address." }),
});

export async function joinWaitlist(prevState: any, formData: FormData) {
  // Extract the email from the raw form data
  const rawEmail = formData.get("email");

  // Validate using Zod
  const validatedFields = waitlistSchema.safeParse({ email: rawEmail });

  if (!validatedFields.success) {
    return { 
      error: validatedFields.error.flatten().fieldErrors.email?.[0] || "Invalid input." 
    };
  }

  const email = validatedFields.data.email;

  try {
    await dbConnect();

    // 2. Check for duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "This email is already on the waitlist!" };
    }

    // 3. Generate a temporary referral code (we'll make this cooler later)
    // This creates a random 6-character string
    const referralCode = Math.random().toString(36).substring(2, 8);

    // 4. Save to the database
    await User.create({
      email,
      referralCode,
    });

    // 5. Return success
    return { success: "You're on the list! Keep an eye on your inbox." };

  } catch (error) {
    console.error("Database error:", error);
    return { error: "Something went wrong on our end. Please try again later." };
  }
}