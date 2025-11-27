import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const PatientInvitationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the doctor sending the invitation
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    patientId: {
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
    },
  },
  { timestamps: true }
);

export default mongoose.model("PatientInvitation", PatientInvitationSchema);
