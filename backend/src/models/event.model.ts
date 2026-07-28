import { Schema, model, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  category:
    | "Sports"
    | "Technical"
    | "Cultural"
    | "Workshop"
    | "Other"
    | "Literary"
    | "Management"
    | "Others";
  eventType?: "Intercollegiate" | "Intracollegiate";
  college?: string;
  capacity: number;
  registeredCount: number;
  cashPrize?: string;
  brochureImage?: string;
  organizer: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Sports",
        "Technical",
        "Cultural",
        "Workshop",
        "Other",
        "Literary",
        "Management",
        "Others",
      ],
      required: true,
    },
    eventType: {
      type: String,
      enum: ["Intercollegiate", "Intracollegiate"],
      required: false,
      default: "Intercollegiate",
    },
    college: { type: String, required: false },
    capacity: { type: Number, required: true },
    registeredCount: { type: Number, default: 0 },
    cashPrize: { type: String, required: false },
    brochureImage: { type: String, required: false },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const EventModel = model<IEvent>("Event", eventSchema);
