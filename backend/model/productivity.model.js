import mongoose from "mongoose";

const prosuctivitySchema = new mongoose.Schema({
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

const Productivity = mongoose.model("Productivity", prosuctivitySchema);

export default Productivity;
