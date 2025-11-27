"use client";
import { Col, Container, Row } from "reactstrap";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import CommonLogo from "../../../../Components/Authentication/Common/CommonLogo";
import { useFormik } from "formik";
import * as Yup from "yup";

import { usePathname, useRouter } from "next/navigation";
import { useSetPasswordMutation } from "@/Redux/features/auth/authApi";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);

  const pathname = usePathname();
  const token = pathname.split("/")[3];
  const router = useRouter();
  const [setPassword, { error, isSuccess }] = useSetPasswordMutation();

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    token: Yup.string(),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
      token,
    },
    validationSchema,
    onSubmit: async ({ newPassword, confirmPassword, token }) => {
      const data = { newPassword, confirmPassword, token };
      try {
        const response = await setPassword({ data });
      } catch (err) {
        if (err.response && err.response.data) {
          toast.error(err.response.data.message); // Display error message from API response
        } else {
          toast.error("An error occurred. Please try again later."); // Generic error message
        }
      }
    },
  });
  useEffect(() => {
    if (isSuccess) {
      toast.success("Password updated Successfully");
      router.push("/auth/login");
    }
    if (error) {
      if ("data" in error) {
        toast.error(error.data.message);
        router.push("/auth/forgot-password");
      }
    }
  }, [isSuccess, error, router]);
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs="12" className="p-0">
          <div className="login-card">
            <div>
              <div>
                <CommonLogo />
              </div>
              <div className="login-main">
                <Form className="theme-form" onSubmit={formik.handleSubmit}>
                  <h2 className="text-center">Reset Password</h2>
                  <p className="text-center">
                    {
                      "Enter your new password. We'll reset your password and redirect you to the login page."
                    }
                  </p>
                  <FormGroup>
                    <Label>New Password</Label>
                    <div className="form-input position-relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="*********"
                        value={formik.values.newPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        invalid={
                          formik.touched.newPassword &&
                          !!formik.errors.newPassword
                        }
                        required
                      />
                      <div className="show-hide">
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className={!showPassword ? "show" : ""}
                        />
                      </div>
                    </div>
                    {formik.touched.newPassword && formik.errors.newPassword ? (
                      <div className="text-danger">
                        {formik.errors.newPassword}
                      </div>
                    ) : null}
                  </FormGroup>
                  <FormGroup>
                    <Label>Confirm Password</Label>
                    <div className="form-input position-relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="*********"
                        value={formik.values.confirmPassword}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        invalid={
                          formik.touched.confirmPassword &&
                          !!formik.errors.confirmPassword
                        }
                        required
                      />
                      <div className="show-hide">
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className={!showPassword ? "show" : ""}
                        />
                      </div>
                    </div>
                    {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword ? (
                      <div className="text-danger">
                        {formik.errors.confirmPassword}
                      </div>
                    ) : null}
                  </FormGroup>
                  <FormGroup className="mb-0 checkbox-checked">
                    <div className="text-end mt-3">
                      <Button
                        color="primary"
                        block
                        className="w-100"
                        type="submit"
                      >
                        Reset Password
                      </Button>
                    </div>
                  </FormGroup>
                  <p className="mt-4 mb-0 text-center">
                    Know your password?
                    <Link className="ms-2" href={`/auth/login`}>
                      Sign In
                    </Link>
                  </p>
                </Form>
              </div>
            </div>
            {/* <Reset /> */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
