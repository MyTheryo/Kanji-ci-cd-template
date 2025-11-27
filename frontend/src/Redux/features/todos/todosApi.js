import { apiSlice } from "../api/apiSlice";

export const todoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTodo: builder.mutation({
      query: (data) => ({
        url: "create-todo",
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
    getSingleTodo: builder.query({
      query: (todoId) => ({
        url: `todos/${todoId}`,
        credentials: "include",
        method: "GET",
      }),
    }),
    GetTodoNotes: builder.query({
      query: ({ patientId, archiveValue }) => ({
        url: `get-all-todo/${patientId}?archive=${archiveValue}`,
        credentials: "include",
        method: "GET",
      }),
    }),
    GetAllTodoData: builder.query({
      query: ({ providerId }) => ({
        url: `get-all-todo-data/${providerId}`,
        credentials: "include",
        method: "GET",
      }),
    }),
    deleteTodo: builder.mutation({
      query: ({ todoId, data }) => ({
        url: `todos/${todoId}`,
        credentials: "include",
        method: "DELETE",
        body: data,
      }),
    }),
    editTodo: builder.mutation({
      query: ({ todoId, data }) => ({
        url: `todos/${todoId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useCreateTodoMutation,
  useGetSingleTodoQuery,
  useGetTodoNotesQuery,
  useDeleteTodoMutation,
  useEditTodoMutation,
  useGetAllTodoDataQuery,
} = todoApi;
