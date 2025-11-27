import mongoose from "mongoose";

const bettermeSchema = new mongoose.Schema({
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

const Betterme = mongoose.model("Betterme", bettermeSchema);

export default Betterme;
