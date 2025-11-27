import { apiSlice } from "../api/apiSlice";

export const todoNotificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTodoNotification: builder.mutation({
            query: (data) => ({
                url: "create-todo-notification",
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

    }),
});

export const {  useCreateTodoNotificationMutation } = todoNotificationApi;
