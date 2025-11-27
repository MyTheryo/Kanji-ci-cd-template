import mongoose from "mongoose";

const weekSummarySchema = new mongoose.Schema({
  weekRange: {
    type: String, // e.g., "09-22-2024 to 09-28-2024"
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // references the user collection
    ref: 'User',
    required: true
  },
  summary: {
    type: String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{ timestamps: true });

const WeekSummary = mongoose.model('WeeklyReportSummary', weekSummarySchema);

export default WeekSummary;
