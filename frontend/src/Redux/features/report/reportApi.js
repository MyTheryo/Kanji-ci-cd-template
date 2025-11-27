import { apiSlice } from "../api/apiSlice";

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Mutation to share weekly report
    shareWeeklyReport: builder.mutation({
      query: (data) => ({
        url: "/share-weekly-report",
        method: "POST",
        body: data,
        credentials: "include", // Include credentials like cookies
      }),
    }),

    // Query to fetch the weekly report for the provider
    fetchWeeklyReportForProvider: builder.query({
      query: (patientId) => ({
        url: `/fetch-weekly-report/${patientId}`,
        method: "GET", // GET request for fetching data
        credentials: "include", // Include credentials like cookies
      }),
    }),
  }),
});

export const {
  useShareWeeklyReportMutation, // Ensure this is correctly exported
  useFetchWeeklyReportForProviderQuery, // Ensure the query hook is exported
} = reportApi;
