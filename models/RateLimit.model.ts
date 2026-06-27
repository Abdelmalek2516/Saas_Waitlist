import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRateLimit extends Document {
  /** sha256(ip + IP_SALT) — never store raw IPs (GDPR / CCPA compliance). */
  ipHash: string;
  action: string;
  count: number;
  /** MongoDB TTL index removes this document automatically after this date. */
  expiresAt: Date;
}

const RateLimitSchema: Schema<IRateLimit> = new Schema({
  ipHash: { type: String, required: true },
  action: { type: String, required: true, default: "waitlist" },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});

// Compound index so every lookup is O(log n) instead of a full collection scan.
RateLimitSchema.index({ ipHash: 1, action: 1 }, { unique: true });

// MongoDB automatically deletes documents once `expiresAt` passes.
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);

export default RateLimit;
