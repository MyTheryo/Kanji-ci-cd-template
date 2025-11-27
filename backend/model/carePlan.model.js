import mongoose, { Schema } from "mongoose"

const carePlanSchema = new mongoose.Schema({
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    carePlan: {
        type: String,
        required: true,
        trim: true,
    },
    primaryICD10Code: {
        type: String,
        trim: true,
    },
    isSigned: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const carePlanSum = mongoose.model('CarePlan-Sum', carePlanSchema);
export default carePlanSum;
