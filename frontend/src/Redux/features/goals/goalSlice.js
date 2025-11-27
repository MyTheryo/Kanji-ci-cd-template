import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  goalCategory: "",
  pageUrl: null,
};

const goalSlice = createSlice({
  name: "goal",
  initialState,
  reducers: {
    setGoalCat: (state, action) => {
      state.goalCategory = action.payload;
    },
    setPageUrl: (state, action) => {
      state.pageUrl = action.payload;
    },
  },
});

export const { setGoalCat, setMoodDate, setPageUrl } = goalSlice.actions;

export default goalSlice.reducer;
