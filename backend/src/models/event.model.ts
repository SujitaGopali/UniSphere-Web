import { Schema, model, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: "Sports" | "Technical" | "Cultural" | "Workshop" | "Other";
  capacity: number;
  registeredCount: number;
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
      enum: ["Sports", "Technical", "Cultural", "Workshop", "Other"],
      required: true,
    },
    capacity: { type: Number, required: true },
    registeredCount: { type: Number, default: 0 },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const EventModel = model<IEvent>("Event", eventSchema);
