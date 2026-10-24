import mongoose, { Schema, type Document } from "mongoose";

export interface IReminderDelivery extends Document {
  dedupeKey: string;
  userId: string;
  jobApplicationId: string;
  reminderType: "followUp" | "interview" | "deadline";
  dueDate: Date;
  sentAt: Date;
}

const ReminderDeliverySchema =
  new Schema<IReminderDelivery>(
    {
      dedupeKey: {
        type: String,
        required: true,
        unique: true,
      },
      userId: {
        type: String,
        required: true,
        index: true,
      },
      jobApplicationId: {
        type: String,
        required: true,
      },
      reminderType: {
        type: String,
        enum: ["followUp", "interview", "deadline"],
        required: true,
      },
      dueDate: {
        type: Date,
        required: true,
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

const ReminderDelivery =
  mongoose.models.ReminderDelivery ||
  mongoose.model<IReminderDelivery>(
    "ReminderDelivery",
    ReminderDeliverySchema
  );

export default ReminderDelivery;