import { apiSlice } from "../api/apiSlice";

export const moodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMood: builder.mutation({
      query: (data) => ({
        url: "create-mood",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    updateMood: builder.mutation({
      query: ({ moodId, data }) => ({
        url: `update-mood/${moodId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
    getAllMood: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `get-all-mood?page=${page}&limit=${limit}`,
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    getLatestMood: builder.query({
      query: () => ({
        url: "get-latest-mood",
        method: "GET",
        credentials: "include",
      }),
    }),
    GetAllPatientMood: builder.query({
      query: (patientId) => ({
        url: `get-all-patient-mood/${patientId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    GetLatestPatientMood: builder.query({
      query: (patientId) => ({
        url: `get-latest-patient-mood/${patientId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    getMoodCount: builder.query({
      query: () => ({
        url: "get-mood-by-count",
        method: "GET",
        credentials: "include",
      }),
    }),
    GetMoodByDate: builder.query({
      query: () => ({
        url: "get-mood-by-date",
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    GetMoodByWeek: builder.query({
      query: () => ({
        url: "get-mood-by-week",
        method: "GET",
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),
    GetMoodCountByTwoWeeks: builder.query({
      query: () => ({
        url: "get-mood-by-two-weeks",
        method: "GET",
        credentials: "include",
      }),
    }),
    GetMoodReportByFourWeeks: builder.query({
      query: () => ({
        url: "get-mood-report-by-four-weeks",
        method: "GET",
        credentials: "include",
      }),
    }),
    getAllActivities: builder.query({
      query: () => ({
        url: "get-all-activities",
        method: "GET",
        credentials: "include",
      }),
    }),
    getActivityCount: builder.query({
      query: () => ({
        url: "get-activity-by-count",
        method: "GET",
        credentials: "include",
      }),
    }),
    getSleepActivityCount: builder.query({
      query: () => ({
        url: "get-sleep-activity-by-count",
        method: "GET",
        credentials: "include",
      }),
    }),
    updateMoodSwpById: builder.mutation({
      query: (data) => ({
        url: `update-mood-swp`,
        credentials: "include",
        method: "PUT",
        body: data,
      }),
    }),
    generateWeeklyReport: builder.mutation({
      query: (data) => ({
        url: `generate-weekly-report`, // Generate weekly report
        credentials: "include",
        method: "POST",
        body: data, // Sending the startDate and endDate in the body
      }),
    }),
  }),
});

export const {
  useCreateMoodMutation,
  useGetAllMoodQuery,
  useGetLatestMoodQuery,
  useGetMoodCountQuery,
  useGetMoodByDateQuery,
  useGetMoodByWeekQuery,
  useGetMoodCountByTwoWeeksQuery,
  useGetMoodReportByFourWeeksQuery,
  useGetAllActivitiesQuery,
  useGetActivityCountQuery,
  useGetSleepActivityCountQuery,
  useUpdateMoodSwpByIdMutation,
  useGetAllPatientMoodQuery,
  useGetLatestPatientMoodQuery,
  useUpdateMoodMutation,
  useGenerateWeeklyReportMutation,
} = moodApi;
