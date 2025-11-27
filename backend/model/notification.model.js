import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
    },
    frequency: {
      type: String,
      required: true,
      enum: ["Daily", "Weekly", "Monthly"],
    },
    lastSent: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
