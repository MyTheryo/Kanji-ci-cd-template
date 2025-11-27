import mongoose from "mongoose";

// Define schema for time
const timeSchema = new mongoose.Schema({
  selectedHour: {
    type: Number,
    required: true,
  },
  selectedMinute: {
    type: Number,
    required: true,
  },
  selectedPeriod: {
    type: String,
    enum: ["AM", "PM"],
    required: true,
  },
});

const noteSchema = new mongoose.Schema(
  {
    title: String,
    date: {
      type: String,
      default: new Date().toLocaleDateString(),
    },
    time: timeSchema,
    duration: String,
    service: String,
    notes: String,
    additionalNotes: String,
    recommendation: [String],
    frequency: String,
    isSigned: {
      type: Boolean,
      default: false,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    type: {
      type: String,
      default: "notes",
    },
  },
  { timestamps: true }
);

// Create a model based on the schema
const Notes = mongoose.model('Notes', noteSchema);

export default Notes