import { Document, Schema, Types, model } from "mongoose";

export type ItineraryStatus = "draft" | "published" | "archived";

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: Date;
  activities: Activity[];
}

export interface ItineraryDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  destination: string;
  clientName: string;
  clientEmail: string;
  startDate: Date;
  endDate: Date;
  days: ItineraryDay[];
  status: ItineraryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<Activity>(
  {
    time: { type: String, required: true, trim: true, maxlength: 40 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, default: "", maxlength: 2000 },
    location: { type: String, default: "", trim: true, maxlength: 200 },
    cost: { type: Number, min: 0 }
  },
  { _id: false }
);

const daySchema = new Schema<ItineraryDay>(
  {
    dayNumber: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    activities: { type: [activitySchema], default: [] }
  },
  { _id: false }
);

const itinerarySchema = new Schema<ItineraryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    destination: { type: String, required: true, trim: true, maxlength: 200 },
    clientName: { type: String, required: true, trim: true, maxlength: 100 },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: [daySchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      required: true
    }
  },
  { timestamps: true }
);

itinerarySchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate("endDate", "endDate must be on or after startDate.");
  }
});

itinerarySchema.index({ userId: 1, createdAt: -1 });
itinerarySchema.index({ userId: 1, status: 1 });
itinerarySchema.index({ userId: 1, destination: 1 });

export const Itinerary = model<ItineraryDocument>("Itinerary", itinerarySchema);
