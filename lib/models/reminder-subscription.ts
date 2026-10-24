import mongoose, { Schema, type Document } from "mongoose";

export interface IReminderSubscription extends Document {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSubscriptionSchema =
  new Schema<IReminderSubscription>(
    {
      userId: {
        type: String,
        required: true,
        index: true,
      },
      endpoint: {
        type: String,
        required: true,
        unique: true,
      },
      keys: {
        p256dh: {
          type: String,
          required: true,
        },
        auth: {
          type: String,
          required: true,
        },
      },
      expirationTime: {
        type: Number,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

ReminderSubscriptionSchema.index({
  userId: 1,
  endpoint: 1,
});

const ReminderSubscription =
  mongoose.models.ReminderSubscription ||
  mongoose.model<IReminderSubscription>(
    "ReminderSubscription",
    ReminderSubscriptionSchema
  );

export default ReminderSubscription;