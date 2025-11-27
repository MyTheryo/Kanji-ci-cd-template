import React, { useEffect } from "react";
import CommonModal from "@/CommonComponent/Common/CommonModal";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Input, Label, Form, FormGroup } from "reactstrap";
import { useAddDoctorMutation } from "@/Redux/features/user/userApi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { encodeBase64 } from "@/utils/helpers";

const AddDoctorModal = ({ isOpen, onClose, refetchInvitedDoctors }) => {
  const router = useRouter();
  const [addDoctor, { data, error, isSuccess, isLoading }] =
    useAddDoctorMutation();

  // Formik and Yup for form handling and validation
  const formik = useFormik({
    initialValues: {
      // npiNumber: "",
      providerId: "",
      doctorName: "",
      doctorEmail: "",
    },
    validationSchema: Yup.object({
      // npiNumber: Yup.string().required("License Number is required"),
      providerId: Yup.string()
        .matches(
          /^\d{6}$/,
          "Provider ID must be 6 digits long and numeric only"
        )
        .required("Provider ID is required"),
      doctorName: Yup.string().required("Provider Name is required"),
      doctorEmail: Yup.string()
        .email("Invalid email address")
        .required("Provider Email is required"),
    }),
    onSubmit: async ({ providerId, doctorName, doctorEmail }) => {
      try {
        const addProviderData = {
          providerId: encodeBase64(providerId),
          doctorName,
          doctorEmail,
        };
        await addDoctor(addProviderData);
      } catch (error) {
        toast.error("Failed to add provider. Please try again later.");
      }
    },
  });

  useEffect(() => {
    if (isSuccess) {
      if (data?.success === false) {
        // Error handling based on success = false from response
        toast.error(data.message, { duration: 5000 });
      } else {
        // Success message
        toast.success("Provider added successfully", { duration: 5000 });
        refetchInvitedDoctors(); // Refetch invited doctors
      }
      formik.resetForm(); // Reset form after success
      onClose(); // Close modal after success
      router.push("/user/home"); // Redirect after success
    }

    if (error) {
      if (error?.data?.message) {
        toast.error(error.data.message); // Display backend error message
      } else {
        toast.error("Failed to add provider. Please try again.");
      }
    }
  }, [router, data, isSuccess, error]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  return (
    <CommonModal centered isOpen={isOpen} toggle={onClose}>
      <div className="modal-toggle-wrapper">
        <div className="d-flex justify-content-between items-center">
          <h3>Add New Provider</h3>
          <Button color="danger" className="" onClick={onClose}>
            X
          </Button>
        </div>
        <Form onSubmit={formik.handleSubmit}>
          <div className="my-2">
            {/* <FormGroup>
              <Label>License Number</Label>
              <Input
                type="text"
                name="npiNumber"
                placeholder="License number"
                value={formik.values.npiNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={formik.touched.npiNumber && !!formik.errors.npiNumber}
              />
              {formik.touched.npiNumber && formik.errors.npiNumber ? (
                <div className="text-danger">{formik.errors.npiNumber}</div>
              ) : null}
            </FormGroup> */}
            <FormGroup>
              <Label>Provider ID</Label>
              <Input
                type="number"
                name="providerId"
                placeholder="Provider ID"
                value={formik.values.providerId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  formik.touched.providerId && !!formik.errors.providerId
                }
              />
              {formik.touched.providerId && formik.errors.providerId ? (
                <div className="text-danger">{formik.errors.providerId}</div>
              ) : null}
            </FormGroup>
            <FormGroup>
              <Label className="">Provider Name</Label>
              <Input
                type="text"
                name="doctorName"
                placeholder="Provider Name"
                value={formik.values.doctorName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  formik.touched.doctorName && !!formik.errors.doctorName
                }
              />
              {formik.touched.doctorName && formik.errors.doctorName ? (
                <div className="text-danger">{formik.errors.doctorName}</div>
              ) : null}
            </FormGroup>
            <FormGroup>
              <Label className="">Provider Email</Label>
              <Input
                type="email"
                name="doctorEmail"
                placeholder="Provider Email"
                value={formik.values.doctorEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                invalid={
                  formik.touched.doctorEmail && !!formik.errors.doctorEmail
                }
              />
              {formik.touched.doctorEmail && formik.errors.doctorEmail ? (
                <div className="text-danger">{formik.errors.doctorEmail}</div>
              ) : null}
            </FormGroup>
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

export default AddDoctorModal;
