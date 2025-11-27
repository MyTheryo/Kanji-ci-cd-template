"use client";
import { createSlice } from "@reduxjs/toolkit";

const LayoutSlice = createSlice({
  name: "layout",
  initialState: {
    sidebarClose: false,
    pinedMenu: [""],
    margin: 0,
    flip: false,
    responsiveSearch: false,
  },
  reducers: {
    setSidebarClose: (state, action) => {
      state.sidebarClose = action.payload;
    },
    setPinedMenu: (state, action) => {
      state.pinedMenu = action.payload;
    },
    handlePined: (state, action) => {
      if (action.payload) {
        if (state.pinedMenu.includes(action.payload)) {
          let filterMenu = state.pinedMenu.filter(
            (item) => item !== action.payload
          );
          state.pinedMenu = filterMenu;
        } else {
          state.pinedMenu = [...state.pinedMenu, action.payload];
        }
      }
    },
    setResponsiveSearch: (state) => {
      state.responsiveSearch = !state.responsiveSearch;
    },
    scrollToLeft: (state) => {
      state.margin += 500;
    },
    scrollToRight: (state) => {
      state.margin -= 500;
    },
    setFlip: (state) => {
      state.flip = !state.flip;
    },
  },
});

export const {
  setSidebarClose,
  setPinedMenu,
  handlePined,
  scrollToLeft,
  scrollToRight,
  setFlip,
  setResponsiveSearch,
} = LayoutSlice.actions;
export default LayoutSlice.reducer;
