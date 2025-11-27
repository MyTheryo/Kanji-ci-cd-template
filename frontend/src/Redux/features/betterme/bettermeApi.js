import { apiSlice } from "../api/apiSlice";

export const bettermeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBetterme: builder.mutation({
      query: (data) => ({
        url: "create-betterme",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllBetterme: builder.query({
      query: () => ({
        url: "getall-betterme",
        method: "GET",
        credentials: "include",
      }),
      // providesTags: ["Emotion"],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
        } catch (error) {
          console.log(error);
        }
      },
    }),
    deleteBetterme: builder.mutation({
      query: (id) => ({
        url: "delete-betterme",
        method: "DELETE",
        body: { id },
        credentials: "include",
      }),
    }),
  }),
});

export const { useCreateBettermeMutation, useGetAllBettermeQuery,useDeleteBettermeMutation } = bettermeApi;
