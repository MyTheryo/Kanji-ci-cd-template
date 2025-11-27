import mongoose from "mongoose"

const sharedSummarySchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    summaryTableName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const sharedSummary = mongoose.model('SharedSummary', sharedSummarySchema);
export default sharedSummary;
