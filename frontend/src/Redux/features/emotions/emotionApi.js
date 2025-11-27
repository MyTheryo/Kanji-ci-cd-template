import { apiSlice } from "../api/apiSlice";

export const emotionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createEmotion: builder.mutation({
      query: (data) => ({
        url: "create-emotion",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getAllEmotions: builder.query({
      query: () => ({
        url: "getall-emotion",
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
    deleteEmotion: builder.mutation({
      query: (id) => ({
        url: "delete-emotion",
        method: "DELETE",
        body: { id },
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateEmotionMutation,
  useGetAllEmotionsQuery,
  useDeleteEmotionMutation
  
} = emotionApi;
