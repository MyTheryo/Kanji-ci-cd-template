import mongoose, { Schema } from "mongoose"

const ijEmailTemplateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    template: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const IJEmailTemplate = mongoose.model('IJ-EmailTemplates', ijEmailTemplateSchema);
export default IJEmailTemplate;
