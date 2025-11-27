import mongoose, { Schema } from "mongoose"

const aiptSumSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    summary: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const aiptSum = mongoose.model('AIPT-Sum', aiptSumSchema);
export default aiptSum;
