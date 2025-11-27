import mongoose, { Schema } from "mongoose"

const notesSumSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    summary: {
        type: Array,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const notesSum = mongoose.model('Notes-Sum', notesSumSchema);
export default notesSum;
