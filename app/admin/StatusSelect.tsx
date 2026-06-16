"use client";

import { useTransition } from "react";
import { updateUserStatus } from "@/actions/admin";

const STATUS_STYLES = {
  waitlisted: "border-slate-200 bg-slate-100 text-slate-600",
  invited: "border-amber-200 bg-amber-100 text-amber-700",
  joined: "border-green-200 bg-green-100 text-green-700",
};

type Status = "waitlisted" | "invited" | "joined";

export function StatusSelect({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: Status;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Status;
    startTransition(async () => {
      await updateUserStatus(userId, newStatus);
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity ${
        STATUS_STYLES[currentStatus]
      } ${isPending ? "opacity-50" : "cursor-pointer"} appearance-none`}
    >
      <option value="waitlisted">waitlisted</option>
      <option value="invited">invited</option>
      <option value="joined">joined</option>
    </select>
  );
}
