import { createSlice } from "@reduxjs/toolkit";
import { setGoalCat } from "../goals/goalSlice";

const initialState = {
  mood: "",
  emoji: null,
  // activities: [],
  goal: {},
  // betterme: {},
  // productivity: {},
  // therapyProcess: null,
  // sleepRoutine: null,
  notes: "",
  date: new Date().toISOString(),
};
const moodSlice = createSlice({
  name: "mood",
  initialState,
  reducers: {
    setMood(state, action) {
      state.mood = action.payload;
    },
    setEmoji(state, action) {
      state.emoji = action.payload;
    },
    setActivities(state, action) {
      const activityIndex = state.activities.indexOf(action.payload);
      if (activityIndex !== -1) {
        state.activities.splice(activityIndex, 1);
      } else {
        state.activities.push(action.payload);
      }
    },
    setGoal(state, action) {
      state.goal = { ...state.goal, ...action.payload };
    },
    setBetterme(state, action) {
      state.betterme = { ...state.betterme, ...action.payload };
    },
    setProductivity(state, action) {
      state.productivity = { ...state.productivity, ...action.payload };
    },
    setTherapyProcess(state, action) {
      state.therapyProcess = action.payload;
    },
    setSleepRoutine(state, action) {
      state.sleepRoutine = action.payload;
    },
    setNotes(state, action) {
      state.notes = action.payload;
    },
    setMoodDate(state, action) {
      state.date = action.payload;
    },
    resetState(state) {
      Object.assign(state, initialState);
    },
    updateMood(state, action) {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  setMood,
  setEmoji,
  setGoal,
  setActivities,
  setBetterme,
  setProductivity,
  setTherapyProcess,
  setSleepRoutine,
  setNotes,
  setMoodDate,
  resetState,
  updateMood,
} = moodSlice.actions;

export default moodSlice.reducer;
