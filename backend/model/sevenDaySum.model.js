import mongoose from "mongoose"

const sevenDaySumSchema = new mongoose.Schema({
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

const sevenDaySum = mongoose.model('SevenDay-Sum', sevenDaySumSchema);
export default sevenDaySum;