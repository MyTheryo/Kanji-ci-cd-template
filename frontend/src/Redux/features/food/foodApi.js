import { apiSlice } from "../api/apiSlice";

export const foodApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createFood: builder.mutation({
      query: (data) => ({
        url: "create-food",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllFood: builder.query({
      query: () => ({
        url: "getall-food",
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
    deleteFood: builder.mutation({
      query: (id) => ({
        url: "delete-food",
        method: "DELETE",
        body: {id},
        credentials: "include",
      }),
    }),
  }),
});

export const { useCreateFoodMutation, useGetAllFoodQuery, useDeleteFoodMutation } = foodApi;
