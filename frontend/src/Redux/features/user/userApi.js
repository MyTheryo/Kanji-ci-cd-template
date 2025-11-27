import { apiSlice } from "../api/apiSlice";
import {
  userLoggedIn,
  userActivation,
  userRegistration,
  updateUserInfo,
} from "../auth/authSlice";
import { getSession } from "next-auth/react";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateAvatar: builder.mutation({
      query: (data) => ({
        url: "update-user-avatar",
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
    editProfile: builder.mutation({
      query: (data) => ({
        url: "update-user-info",
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          updateUserInfo({
            user: result.data.user,
          });
        } catch (error) {
          console.log(error);
        }
      },
    }),

    changePassword: builder.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: "update-user-password",
        method: "PUT",
        body: { oldPassword, newPassword },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          userLoggedIn({
            user: result.data.user,
          });
        } catch (error) {
          console.log(error);
        }
      },
    }),

    changeEmail: builder.mutation({
      query: ({ currentEmail, currentPassword, newEmail }) => ({
        url: "update-user-email",
        method: "PUT",
        body: { currentEmail, currentPassword, newEmail },
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
              user: {
                email: result?.data?.email,
                oldEmail: result?.data?.oldEmail,
                isUpdateEmail: true,
              },
            })
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),

    newEmailVerification: builder.mutation({
      query: ({ activation_token, activation_code }) => ({
        url: "verify-new-email",
        method: "POST",
        body: { activation_token, activation_code },
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userActivation({
              user: result.data.user,
            })
          );
        } catch (error) {
          console.log(error);
        }
      },
    }),

    getAllUsers: builder.query({
      query: () => ({
        url: "get-users",
        method: "GET",
        credentials: "include",
      }),
    }),
    addDoctor: builder.mutation({
      query: (doctorData) => ({
        url: "add-doctor",
        method: "POST",
        body: doctorData,
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Doctor added successfully:", result);
        } catch (error) {
          console.log("Error adding doctor:", error);
        }
      },
    }),
    getUserInfo: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn(result.data.user));
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      },
    }),
    getUserInfoById: builder.query({
      query: (id) => ({
        url: `user-detail/${id}`,
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getInviteDoctor: builder.query({
      query: () => ({
        url: "invite-doctor",
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
        } catch (error) {
          console.error("Error fetching doctor:", error);
        }
      },
    }),

    getPatientInviteDoctor: builder.query({
      query: (patientId) => {
        const url = patientId
          ? `patient-invite-doctor/${patientId}`
          : "invite-doctor";
        return {
          url: url,
          method: "GET",
          credentials: "include",
        };
      },
      keepUnusedDataFor: 0,
      async onQueryStarted(patientId, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
        } catch (error) {
          console.error("Error fetching doctor:", error);
        }
      },
    }),

    updateDoctorInvitationStatus: builder.mutation({
      query: (data) => ({
        url: `update-doctor-status`,
        credentials: "include",
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useUpdateAvatarMutation,
  useEditProfileMutation,
  useChangePasswordMutation,
  useChangeEmailMutation,
  useNewEmailVerificationMutation,
  useGetAllUsersQuery,
  useAddDoctorMutation,
  useGetUserInfoQuery,
  useGetInviteDoctorQuery,
  useGetPatientInviteDoctorQuery,
  useGetUserInfoByIdQuery,
  useUpdateDoctorInvitationStatusMutation,
} = userApi;
