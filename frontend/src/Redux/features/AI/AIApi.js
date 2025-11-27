import { apiSlice } from "../api/apiSlice";

export const AIApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateJourneySummary: builder.mutation({
      query: (patientId) => ({
        url: "generate-journey-summary",
        method: "POST",
        body: patientId,
        credentials: "include",
      }),
    }),
    getSevenDaySummary: builder.mutation({
      query: (patientId) => ({
        url: "/get-sevenday-summary",
        method: "POST",
        body: patientId,
        credentials: "include",
      }),
    }),
    generateSevenDaySummary: builder.mutation({
      query: (data) => ({
        url: "/generate-sevenday-summary",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    generateNotesSummary: builder.mutation({
      query: (data) => ({
        url: "/generate-notes-summary",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    initialJourney: builder.mutation({
      query: (data) => ({
        url: "/initial-journey",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getConversation: builder.mutation({
      query: (data) => ({
        url: "/get-conversation",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getIJEmailTemp: builder.mutation({
      query: (data) => ({
        url: "/get-ij-EmailTemplate",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    therapistProfile: builder.mutation({
      query: (data) => ({
        url: "/get-therapist-profile",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getPatientNotesSummary: builder.mutation({
      query: (patientId) => ({
        url: "/get-patient-notes-summary",
        method: "POST",
        body: patientId, // Ensure this is an object if that is what the backend expects
        credentials: "include",
      }),
    }),
    shareSummary: builder.mutation({
      query: (data) => ({
        url: "/share-summary",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getSharedSummaries: builder.query({
      query: (providerId) => ({
        url: `/shared-summaries/${providerId}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 0,
    }),
    getCarePlan: builder.query({
      query: ({ patientId, limit }) => {
        let url = `/get-careplan/${patientId}`;
        if (limit) {
          url += `/${limit}`;
        }
        return {
          url,
          method: "GET",
          credentials: "include",
        };
      },
      transformResponse: (response) => response.data,
    }),
    getCarePlanById: builder.query({
      query: (planId) => {
        return {
          url: `/get-careplan-by-id/${planId}`,
          method: "GET",
          credentials: "include",
        };
      },
      keepUnusedDataFor: 0,
      transformResponse: (response) => response.data,
    }),
    updateCarePlan: builder.mutation({
      query: ({ id, isSigned, carePlan }) => ({
        url: `/update-careplan/${id}`,
        method: "PUT",
        body: { isSigned, carePlan },
      }),
    }),
    careplanItems: builder.query({
      query: ({ patientId }) => ({
        url: `/careplanItems/${patientId}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => response.data,
    }),
    generateCareplan: builder.mutation({
      query: (data) => ({
        url: "/generate-careplan",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGenerateJourneySummaryMutation,
  useInitialJourneyMutation,
  useGetConversationMutation,
  useGenerateSevenDaySummaryMutation,
  useGetSevenDaySummaryMutation,
  useGenerateNotesSummaryMutation,
  useGetIJEmailTempMutation,
  useTherapistProfileMutation,
  useGetPatientNotesSummaryMutation,
  useShareSummaryMutation,
  useGetSharedSummariesQuery,
  useGetCarePlanQuery,
  useGenerateCareplanMutation,
  useCareplanItemsQuery,
  useGetCarePlanByIdQuery,
  useUpdateCarePlanMutation,
} = AIApi;
