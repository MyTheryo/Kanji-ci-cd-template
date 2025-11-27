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
import { useChangePasswordMutation } from "@/Redux/features/user/userApi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CommonCardHeader from "../../../../CommonComponent/CommonCardHeader/CommonCardHeader";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles

const ChangePassword = () => {
  const router = useRouter();
  const [changePassword, { isError, data, error, isSuccess }] =
    useChangePasswordMutation();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation schema using Yup
  const passwordSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Please enter your current password"),
    newPassword: Yup.string()
      .required("Please enter your new password")
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+{}|:<>?]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your new password")
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async ({ oldPassword, newPassword, confirmPassword }) => {
      // Ensure new password is different from old
      if (newPassword === oldPassword) {
        toast.error("Please set a new password.");
        return;
      }

      // Ensure new password matches the confirmation password
      if (newPassword !== confirmPassword) {
        toast.error("Passwords don't match. Please try again.");
        return;
      }

      // Submit password change data
      const passwordData = { oldPassword, newPassword, confirmPassword };
      await changePassword(passwordData);
      formik.resetForm();
    },
  });

  // Success/Error handling
  useEffect(() => {
    if (isSuccess) {
      toast.success("Password changed successfully!");
      router.push("/profile");
    }
    if (isError && error?.data?.message) {
      toast.error(error.data.message);
    }
  }, [isSuccess, isError, error, router]);

  return (
    <>
      <Row>
        <Card>
          <CommonCardHeader
            title={"Change Password"}
            tagClass="card-title mb-0"
          />
          <CardBody>
            <Form onSubmit={formik.handleSubmit}>
              {/* Current Password */}
              <FormGroup>
                <Label>Current Password</Label>
                <div className="position-relative">
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    placeholder="Current Password"
                    value={formik.values.oldPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.oldPassword && !!formik.errors.oldPassword
                    }
                  />
                  <Button
                    color="link"
                    size="sm"
                    className="position-absolute top-50 end-0 translate-middle-y mx-2"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {formik.touched.oldPassword && formik.errors.oldPassword && (
                  <div className="text-danger">{formik.errors.oldPassword}</div>
                )}
              </FormGroup>

              {/* New Password */}
              <FormGroup>
                <Label>New Password</Label>
                <div className="position-relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="New Password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.newPassword && !!formik.errors.newPassword
                    }
                  />
                  <Button
                    color="link"
                    size="sm"
                    className="position-absolute top-50 end-0 translate-middle-y mx-2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <div className="text-danger">{formik.errors.newPassword}</div>
                )}
              </FormGroup>

              {/* Confirm Password */}
              <FormGroup>
                <Label>Confirm Password</Label>
                <div className="position-relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    invalid={
                      formik.touched.confirmPassword &&
                      !!formik.errors.confirmPassword
                    }
                  />
                  <Button
                    color="link"
                    size="sm"
                    className="position-absolute top-50 end-0 translate-middle-y mx-2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className="text-danger">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
              </FormGroup>

              <div className="form-footer">
                <Button color="primary" block type="submit">
                  Update Password
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Row>
    </>
  );
};

export default ChangePassword;
