import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  status: "waitlisted" | "invited" | "joined";
  // Populated automatically by { timestamps: true } in the schema
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    referredBy: {
      type: String,
      default: null,
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["waitlisted", "invited", "joined"],
      default: "waitlisted",
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;