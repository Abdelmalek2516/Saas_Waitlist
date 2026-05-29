"use server";

import mongoose from "mongoose";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import User from "@/models/Users.model";

// ── Helper: verify the caller is an admin ─────────────────────────────────────
async function assertAdmin() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated");

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const adminEmails = (process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!adminEmails.includes(email)) throw new Error("Unauthorized");
}

// ── Update a user's status ─────────────────────────────────────────────────────
export async function updateUserStatus(
  userId: string,
  status: "waitlisted" | "invited" | "joined",
) {
  await assertAdmin();
  await dbConnect();

  if (!mongoose.isValidObjectId(userId)) throw new Error("Invalid user ID");

  await User.findByIdAndUpdate(userId, { status });
  revalidatePath("/admin");
}
