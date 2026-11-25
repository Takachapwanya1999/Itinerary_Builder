import bcrypt from "bcryptjs";
import { Document, Schema, model } from "mongoose";

export type UserRole = "admin" | "agent";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  agencyName?: string;
  role: UserRole;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    password: {
      type: String,
      required: true,
      minlength: 12,
      select: false
    },
    agencyName: {
      type: String,
      trim: true,
      maxlength: 150
    },
    role: {
      type: String,
      enum: ["admin", "agent"],
      default: "agent",
      required: true
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (
  this: UserDocument,
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<UserDocument>("User", userSchema);
