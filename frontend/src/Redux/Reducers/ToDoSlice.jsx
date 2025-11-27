import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSideBar: false,
  visible: false,
};

const ToDoSlice = createSlice({
  name: "ToDoSlice",
  initialState,
  reducers: {
    setVisible: (state, action) => {
      state.visible = action.payload;
    },
    setShowSideBar: (state) => {
      state.showSideBar = !state.showSideBar;
    },
  },
});

export const { setShowSideBar, setVisible } = ToDoSlice.actions;

export default ToDoSlice.reducer;
