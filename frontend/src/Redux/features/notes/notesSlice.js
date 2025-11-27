import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  title: "Progress Note",
  date: new Date().toLocaleDateString(),
  time: {
    selectedHour: new Date().getHours() % 12 || 12,
    selectedMinute: new Date().getMinutes(),
    selectedPeriod: new Date().getHours() >= 12 ? "PM" : "AM",
  },
  duration: "15 mins",
  service: "in-person",
  notes: "",
  additionalNotes: "",
  AIsummary: "",
  recommendation: [],
  frequency: "Every 4 Months",
  isSigned: false,
};

const noteSlice = createSlice({
  name: "note",
  initialState,
  reducers: {
    updateTitle(state, action) {
      state.title = action.payload;
    },
    updateDuration(state, action) {
      state.duration = action.payload;
    },
    updateService(state, action) {
      state.service = action.payload;
    },
    updateDate: (state, action) => {
      state.date = action.payload.toLocaleDateString();
    },
    updateTime: (state, action) => {
      state.time = action.payload;
    },
    updateNotes(state, action) {
      state.notes = action.payload;
    },
    updateAdditionalNotes(state, action) {
      state.additionalNotes = action.payload;
    },
    updateAIsummary(state, action) {
      state.AIsummary = action.payload;
    },
    addRecommendation(state, action) {
      const recommendationIndex = state.recommendation.indexOf(action.payload);
      if (recommendationIndex !== -1) {
        state.recommendation.splice(recommendationIndex, 1);
      } else {
        state.recommendation.push(action.payload);
      }
    },
    updateFrequency(state, action) {
      state.frequency = action.payload;
    },
    toggleSigned(state) {
      state.isSigned = !state.isSigned;
    },
    updateStateAndReset(state, action) {
      const payload = action.payload;
      Object.assign(state, payload);
    },
    resetNoteState(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  updateTitle,
  updateDate,
  updateTime,
  updateDuration,
  updateService,
  updateNotes,
  updateAdditionalNotes,
  updateAIsummary,
  addRecommendation,
  updateFrequency,
  toggleSigned,
  updateStateAndReset,
  resetNoteState
} = noteSlice.actions;
export default noteSlice.reducer;
