import mongoose from "mongoose";


const goalSchema = new mongoose.Schema({
  goalTitle: {
    type: String,
    required: true,
  },
  emoji: {
    type:String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default:false
  }
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal
