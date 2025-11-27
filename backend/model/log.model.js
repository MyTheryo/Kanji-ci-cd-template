import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  description: { type: String },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", logSchema);
export default Log;
