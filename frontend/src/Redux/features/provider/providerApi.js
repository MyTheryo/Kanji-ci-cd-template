import { apiSlice } from "../api/apiSlice";

export const providerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllPatients: builder.query({
      query: (data) => ({
        url: "get-patients",
        credentials: "include",
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
      keepUnusedDataFor: 0,
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          if (Array.isArray(result.data)) {
            const patientsToUpdate =
              result.data.filter(/* condition for update */);

            if (patientsToUpdate.length > 0) {
              patientsToUpdate.forEach((patient) => {
                dispatch(updateInvitation(patient.npiNumber, newStatus));
              });
            } else {
              console.log("No patients require status update.");
            }
          } else {
            const actualType = typeof result.data;
            const receivedData = JSON.stringify(result.data, null, 2);
            // console.error(`Expected an array but received ${actualType}. Data:`, receivedData);
          }
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      },
    }),
    GetDocPatients: builder.query({
      query: (queryString) => ({
        url: `get-doc-patient?userIds=${queryString}`,
        credentials: "include",
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
    updatePatientStatus: builder.mutation({
      query: (data) => ({
        url: `update-patient-status`,
        credentials: "include",
        method: "PUT",
        body: data,
      }),
    }),
    deletePatientInvitation: builder.mutation({
      query: (data) => ({
        url: `delete-patient-invitation`,
        credentials: "include",
        method: "PUT",
        body: data,
      }),
    }),
    addPatient: builder.mutation({
      query: (patientData) => ({
        url: "add-patient",
        method: "POST",
        body: patientData,
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          console.log("patient added successfully:", result);
        } catch (error) {
          console.log("Error adding patient:", error);
        }
      },
    }),
  }),
});

export const {
  useGetAllPatientsQuery,
  useGetDocPatientsQuery,
  useUpdatePatientStatusMutation,
  useAddPatientMutation,
  useDeletePatientInvitationMutation,
} = providerApi;
