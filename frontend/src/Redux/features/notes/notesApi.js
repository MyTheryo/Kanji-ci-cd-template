import { apiSlice } from "../api/apiSlice";

export const notesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createNotes: builder.mutation({
      query: (data) => ({
        url: "create-notes",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    generateAISummary: builder.mutation({
      query: (data) => ({
        url: "/generate-ai-summary",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllNotes: builder.query({
      query: (patientId) => ({
        url: `get-all-notes/${patientId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    getAllSessionNotes: builder.query({
      query: () => ({
        url: "get-all-session-notes",
        method: "GET",
        credentials: "include",
      }),
    }),
    getSingleNote: builder.query({
      query: (noteId) => ({
        url: `notes/${noteId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    editNote: builder.mutation({
      query: ({ noteId, data }) => ({
        url: `notes/${noteId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
    // deleteDocument: builder.mutation({
    //   query: (documentId) => ({
    //     url: `documents/${documentId}`,
    //     method: "DELETE",
    //     credentials: "include",
    //   }),
    // }),
  }),
});

export const {
 useCreateNotesMutation,
 useGenerateAISummaryMutation,
 useGetAllNotesQuery,
 useGetAllSessionNotesQuery,
 useGetSingleNoteQuery,
 useEditNoteMutation
} = notesApi;
