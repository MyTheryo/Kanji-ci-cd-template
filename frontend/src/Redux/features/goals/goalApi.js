import { apiSlice } from "../api/apiSlice";

export const goalApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createGoal: builder.mutation({
      query: (data) => ({
        url: "create-goal",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllGoal: builder.query({
      query: () => ({
        url: "getall-goal",
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getCompletedGoal: builder.query({
      query: () => ({
        url: "getall-completed-goal",
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    deleteGoal: builder.mutation({
      query: (id) => ({
        url: `delete-goal/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
    getSinleGoal: builder.query({
      query: (id) => ({
        url: `get-single-goal/${id}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    GetUserAllGoals: builder.query({
      query: (id) => ({
        url: `getuser-all-goals/${id}`,
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    setGoalNotification: builder.mutation({
      query: (data) => ({
        url: `goal-notification`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getNotificationFrequency: builder.query({
      query: () => ({
        url: "get-notification-frequency",
        method: "GET",
        credentials: "include",
      }),
    }),
    updateGoal: builder.mutation({
      query: ({ goalId, data }) => ({
        url: `update-goal/${goalId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateGoalMutation,
  useGetUserAllGoalsQuery,
  useDeleteGoalMutation,
  useGetAllGoalQuery,
  useGetCompletedGoalQuery,
  useSetGoalNotificationMutation,
  useGetNotificationFrequencyQuery,
  useGetSinleGoalQuery,
  useUpdateGoalMutation,
} = goalApi;
