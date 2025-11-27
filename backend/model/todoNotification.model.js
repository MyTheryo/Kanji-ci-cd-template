import mongoose from "mongoose";

const todoNotificationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming it references the User model who is a doctor
    required: true,
  },
  notificationFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'], // Example frequency options
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  lastSent: {
    type: Date, // Tracks when the last notification was sent
    default: null, // Default to null if never sent
  }
}, { timestamps: true });

const TodoNotification = mongoose.model("TodoNotification", todoNotificationSchema);

export default TodoNotification;
