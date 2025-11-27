import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  user: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRegistration: (state, action) => {
      state.token = action.payload.token;
    },
    userActivation: (state, action) => {
      state.user = action.payload.user;
    },
    userLoggedIn: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    updateUserInfo: (state, action) => {
      state.user = action.payload;
    },
    userResetPassword: (state, action) => {
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    userSetPassword: (state, action) => {
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    userLoggedOut: (state) => {
      state.token = "";
      state.user = "";
    },
  },
});

export const {
  userRegistration,
  userActivation,
  userLoggedIn,
  userResetPassword,
  userSetPassword,
  userLoggedOut,
  updateUserInfo,
} = authSlice.actions;

export default authSlice.reducer;
