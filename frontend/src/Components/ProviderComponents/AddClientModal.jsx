import React, { useEffect, useState } from "react";
import { useAddPatientMutation } from "@/Redux/features/provider/providerApi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import CommonModal from "@/CommonComponent/Common/CommonModal";
import { Button, Input, Label, Form, FormGroup } from "reactstrap";
import { useSession } from "next-auth/react";
import { encodeBase64 } from "@/utils/helpers";

const AddClientModal = ({ centred, centeredToggle, fetchPatients }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [addPatient, { data: pData, error, isSuccess, isLoading }] =
    useAddPatientMutation({
      refetchOnMountOrArgChange: true,
    });

  const [shouldResetForm, setShouldResetForm] = useState(false); // Control form reset

  useEffect(() => {
    if (isSuccess) {
      if (pData.success) {
        toast.success(pData?.message, { duration: 5000 });
      } else {
        toast.error(pData?.message, { duration: 5000 });
      }
      formik.resetForm(); // Reset form after success
      setShouldResetForm(true); // Mark form for reset
      centeredToggle(); // Close modal after success
      fetchPatients(); // Fetch patients after adding new patient
      router.refresh();
    }
    if (error) {
      if ("data" in error) {
        const errorData = error;
        toast.error(errorData.data.message);
      }
    }
  }, [router, pData, isSuccess, error]);

  const formik = useFormik({
    initialValues: {
      npiNumber: session?.user?.npiNumber,
      patientName: "",
      patientId: "",
      // patientEmail: "",
    },
    validationSchema: Yup.object({
      patientName: Yup.string().required("Client Name is required"),
      patientId: Yup.string()
        .matches(
          /^\d{6}$/,
          "Customer ID must be 6 digits long and numeric only"
        )
        .required("Customer ID is required"),
      // patientEmail: Yup.string()
      //   .email("Invalid email address")
      //   .required("Client Email is required"),
    }),
    onSubmit: async ({ npiNumber, patientName, patientId }) => {
      try {
        const addPatientData = {
          npiNumber,
          patientName,
          patientId: encodeBase64(patientId),
        };
        await addPatient(addPatientData);
      } catch (error) {
        toast.error("Failed to add client. Please try again later.");
      }
    },
    // onSubmit: async ({ npiNumber, patientName, patientEmail }) => {
    //   try {
    //     const addPatientData = {
    //       npiNumber,
    //       patientName,
    //       patientEmail,
    //     };
    //     await addPatient(addPatientData);
    //   } catch (error) {
    //     toast.error("Failed to add client. Please try again later.");
    //   }
    // },
  });

  // Reset form validation errors when modal closes
  const handleCloseModal = () => {
    formik.resetForm(); // Reset form values and touched fields
    centeredToggle(); // Close the modal
  };

  // Reset form only when modal opens after successful submission
  useEffect(() => {
    if (centred && shouldResetForm) {
      formik.resetForm();
      setShouldResetForm(false); // Reset flag
    }
  }, [centred, shouldResetForm]);

  return (
    <CommonModal centered isOpen={centred} toggle={handleCloseModal}>
      <div className="modal-toggle-wrapper">
        <div className="d-flex justify-content-between items-center">
          <h3>Add New Client</h3>
          <Button color="danger" onClick={handleCloseModal}>
            X
          </Button>
        </div>
        <Form onSubmit={formik.handleSubmit}>
          <div className="my-2">
            <FormGroup>
              <Label>Client Name</Label>
              <Input
                type="text"
                name="patientName"
                placeholder="Client Name"
                value={formik.values.patientName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  formik.touched.patientName && !!formik.errors.patientName
                }
              />
              {formik.touched.patientName && formik.errors.patientName ? (
                <div className="text-danger">{formik.errors.patientName}</div>
              ) : null}
            </FormGroup>
            <FormGroup>
              <Label>Client ID</Label>
              <Input
                type="number"
                name="patientId"
                placeholder="Client ID"
                value={formik.values.patientId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.patientId && !!formik.errors.patientId}
              />
              {formik.touched.patientId && formik.errors.patientId ? (
                <div className="text-danger">{formik.errors.patientId}</div>
              ) : null}
            </FormGroup>
            {/* <FormGroup>
              <Label>Client Email</Label>
              <Input
                type="email"
                name="patientEmail"
                placeholder="Client Email"
                value={formik.values.patientEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  formik.touched.patientEmail && !!formik.errors.patientEmail
                }
              />
              {formik.touched.patientEmail && formik.errors.patientEmail ? (
                <div className="text-danger">{formik.errors.patientEmail}</div>
              ) : null}
            </FormGroup> */}
          </div>
          <Button
            color="primary"
            className="d-flex m-auto"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <i className="fa fa-spinner fa-spin px-3"></i>
            ) : (
              "Send Request"
            )}
          </Button>
        </Form>
      </div>
    </CommonModal>
  );
};

export default AddClientModal;
