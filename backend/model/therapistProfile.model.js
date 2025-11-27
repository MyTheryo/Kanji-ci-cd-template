import mongoose from "mongoose"

const therapistProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    therapistProfile: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const therapistProfile = mongoose.model('Therapist-Profile', therapistProfileSchema);
export default therapistProfile;
