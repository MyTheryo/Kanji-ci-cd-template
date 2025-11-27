import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Row,
  FormGroup,
  Input,
  Form,
  Label,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useChangeEmailMutation } from "@/Redux/features/user/userApi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CommonCardHeader from "../../../../CommonComponent/CommonCardHeader/CommonCardHeader";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

const ChangeEmail = ({ email }) => {
  const router = useRouter();
  const [changeEmail, { isError, data, error, isSuccess, isLoading }] =
    useChangeEmailMutation();
  const [showPassword, setShowPassword] = useState(false);

  // Validation schema using Yup
  const passwordSchema = Yup.object().shape({
    currentEmail: Yup.string().required("Please enter your current email"),
    currentPassword: Yup.string().required(
      "Please enter your current password"
    ),
    newEmail: Yup.string()
      .required("Please enter your new email")
      .email("Please enter a valid email"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      currentEmail: email || "",
      currentPassword: "",
      newEmail: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async ({ currentEmail, currentPassword, newEmail }) => {
      // Ensure new password is different from old
      if (currentEmail === newEmail) {
        toast.error("Please set a new email.");
        return;
      }
      currentPassword = btoa(currentPassword);
      // Submit password change data
      const emailData = { currentEmail, currentPassword, newEmail };
      await changeEmail(emailData);
      formik.resetForm();
    },
  });

  // Success/Error handling
  useEffect(() => {
    if (isSuccess) {
      const message = data?.message || "Registration successful";
      toast.success(message, { duration: 5000 });
      router.push("/auth/verification");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, isError, error, router]);

  return (
    <>
      <Row>
        <Card>
          <CommonCardHeader title={"Change Email"} tagClass="card-title mb-0" />
          <CardBody>
            <Form onSubmit={formik.handleSubmit}>
              {/* Current Email */}
              <FormGroup>
                <Label>Current Email</Label>
                <div className="position-relative">
                  <Input
                    type={"text"}
                    name="currentEmail"
                    placeholder="Current Email"
                    value={formik.values.currentEmail}
                    disabled
                  />
                </div>
              </FormGroup>

              {/* Current Password */}
              <FormGroup>
                <Label>Current Password</Label>
                <div className="position-relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Current Password"
                    value={formik.values.currentPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.currentPassword &&
                      !!formik.errors.currentPassword
                    }
                  />
                  <Button
                    color="link"
                    size="sm"
                    className="position-absolute top-50 end-0 translate-middle-y mx-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {formik.touched.currentPassword &&
                  formik.errors.currentPassword && (
                    <div className="text-danger">
                      {formik.errors.currentPassword}
                    </div>
                  )}
              </FormGroup>

              {/* New Email */}
              <FormGroup>
                <Label>New Email</Label>
                <div className="position-relative">
                  <Input
                    type={"email"}
                    name="newEmail"
                    placeholder="New Email"
                    value={formik.values.newEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.newEmail && !!formik.errors.newEmail
                    }
                  />
                </div>
                {formik.touched.newEmail && formik.errors.newEmail && (
                  <div className="text-danger">{formik.errors.newEmail}</div>
                )}
              </FormGroup>

              <div className="form-footer">
                <Button
                  color="primary"
                  block
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fa fa-spinner fa-spin"></i>
                  ) : (
                    "Update Email"
                  )}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Row>
    </>
  );
};

export default ChangeEmail;
