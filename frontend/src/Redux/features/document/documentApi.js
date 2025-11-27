import { apiSlice } from "../api/apiSlice";

export const documentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDocument: builder.mutation({
      query: (data) => ({
        url: "create-document",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllDocumets: builder.query({
      query: (patientId) => ({
        url: `get-all-documents/${patientId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    getSingleDocument: builder.query({
      query: (documentId) => ({
        url: `documents/${documentId}`,
        method: "GET",
        credentials: "include",
      }),
    }),
    editDocumet: builder.mutation({
      query: ({ documentId, data }) => ({
        url: `documents/${documentId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
    deleteDocument: builder.mutation({
      query: (documentId) => ({
        url: `documents/${documentId}`,
        method: "DELETE",
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useGetAllDocumetsQuery,
  useEditDocumetMutation,
  useGetSingleDocumentQuery,
  useDeleteDocumentMutation,
} = documentApi;
