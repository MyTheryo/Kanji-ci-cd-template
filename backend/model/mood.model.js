import mongoose from "mongoose";

const moodSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      required: true,
    },
    emoji: {
      type: String,
    },
    // activities: [
    //   {
    //     type: String,
    //   },
    // ],
    goal: {
      goalTitle: {
        type: String,
      },
      goalIcon: {
        type: String,
      },
    },
    // betterme: {
    //   bettermeTitle: {
    //     type: String,
    //   },
    //   bettermeIcon: {
    //     type: String,
    //   },
    // },
    // productivity: {
    //   productivityTitle: {
    //     type: String,
    //   },
    //   productivityIcon: {
    //     type: String,
    //   },
    // },
    // therapyProcess: {
    //   type: String,
    //   default: null,
    // },
    // sleepRoutine: {
    //   type: String,
    //   default: null,
    // },
    notes: {
      type: String,
      default: null,
    },
    swp: {
      type: Number,
      default: 0,
      enum: [0, 1], // This ensures the value is restricted to 0 or 1.
    },
    date: {
      type: String,
      // type: Date,
      // default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Create model from schema
const Mood = mongoose.model("Mood", moodSchema);

export default Mood;
