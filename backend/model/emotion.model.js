import mongoose from "mongoose";

const emotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Emotion = mongoose.model("Emotion", emotionSchema);

export default Emotion;
