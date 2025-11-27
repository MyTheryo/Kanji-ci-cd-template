import { apiSlice } from "../api/apiSlice";
import {
  userLoggedIn,
  userLoggedOut,
  userRegistration,
  userActivation,
  userResetPassword,
  userSetPassword,
} from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: "registration",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userRegistration({
              token: result.data.activationToken,
            })
          );
          dispatch(
            userActivation({
              user: { email: result.data.email, isUpdateEmail: false },
            })
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),
    activation: builder.mutation({
      query: ({ activation_token, activation_code }) => ({
        url: "activate-user",
        method: "POST",
        body: { activation_token, activation_code },
      }),
    }),
    resendOTP: builder.mutation({
      query: ({ email, newEmail, currentEmail }) => ({
        url: "resend-otp",
        method: "POST",
        body: { email, newEmail, currentEmail },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userRegistration({ token: result.data.activationToken }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    resetPassword: builder.mutation({
      query: ({ email }) => ({
        url: "reset-user-password",
        method: "POST",
        body: { email },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userResetPassword({ token: result.data.activationToken }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    setPassword: builder.mutation({
      query: ({ data }) => ({
        url: "set-password",
        method: "PUT",
        body: { data },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userSetPassword({ token: result.data.activationToken }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: `${process.env.NEXT_PUBLIC_SERVER_URL}login`,
        method: "POST",
        body: {
          email,
          password,
        },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              token: result.data.accessToken,
              user: result.data.user,
            })
          );
        } catch (error) {}
      },
    }),
    logOut: builder.mutation({
      query: () => ({
        url: "logout",
        method: "POST",
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          // dispatch(
          //   userLoggedOut({
          //     token: "",
          //     user: "",
          //   })
          // );
        } catch (error) {
          console.error("Logout failed:", error);
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useActivationMutation,
  useResendOTPMutation,
  useLoginMutation,
  useResetPasswordMutation,
  useSetPasswordMutation,
  useLogOutMutation,
} = authApi;
