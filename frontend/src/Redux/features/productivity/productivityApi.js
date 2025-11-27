import { apiSlice } from "../api/apiSlice";

export const productivityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProductivity: builder.mutation({
      query: (data) => ({
        url: "create-productivity",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllProductivity: builder.query({
      query: () => ({
        url: "getall-productivity",
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
    deleteProductivity: builder.mutation({
      query: (id) => ({
        url: "delete-productivity",
        method: "DELETE",
        body: { id },
        credentials: "include",
      }),
    }),
  }),
});

export const { useCreateProductivityMutation, useGetAllProductivityQuery,useDeleteProductivityMutation } =
  productivityApi;
