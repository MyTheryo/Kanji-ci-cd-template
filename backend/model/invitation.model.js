import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const InvitationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    doctorEmail: {
      type: String,
      required: true,
    },
    sentOn: {
      type: Date,
      default: Date.now,
      required: true,
    },
    invitationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    acceptedOn: {
      type: Date,
      required: false,
    },
    isDeleted: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invitation", InvitationSchema);
