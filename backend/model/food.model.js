import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
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

const Food = mongoose.model("Food", foodSchema);

export default Food;
