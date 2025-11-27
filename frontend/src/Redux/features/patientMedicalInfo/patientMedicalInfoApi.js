import { apiSlice } from "../api/apiSlice";

export const patientMedicalInfoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // getSinglePatientMedicalInfo: builder.query({
    //   query: (patientId) => ({
    //     url: `patientMedicalInfo/${patientId}`,
    //     credentials: "include",
    //     method: "GET",
    //   }),
    // }),
    editPatientMedicalInfo: builder.mutation({
      query: ({ patientId, data }) => ({
        url: `patientMedicalInfo/${patientId}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  // useGetSinglePatientMedicalInfoQuery,
  useEditPatientMedicalInfoMutation,
} = patientMedicalInfoApi;
