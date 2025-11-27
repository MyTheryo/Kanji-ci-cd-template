import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import CommonLogo from "./Common/CommonLogo";
import { useFormik } from "formik";
import * as Yup from "yup";

const Reset = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      // Add your form submission logic here
      toast.success("Password reset successfully!");
      router.push("/auth/login");
    },
  });

  return (
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
                  formik.touched.newPassword && !!formik.errors.newPassword
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
              <div className="text-danger">{formik.errors.newPassword}</div>
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
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="text-danger">{formik.errors.confirmPassword}</div>
            ) : null}
          </FormGroup>
          <FormGroup className="mb-0 checkbox-checked">
            <div className="text-end mt-3">
              <Button color="primary" block className="w-100" type="submit">
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
  );
};

export default Reset;
