"use client";
import { useState, useEffect } from "react";
import CommonLogo from "./CommonLogo";
import { Button, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CreateAccount,
  CreateYourAccount,
  EmailAddress,
  EmailsPlaceHolder,
  FirstName,
  LastName,
  Password,
  SignIn,
  YourName,
} from "../../../Constant";
import Link from "next/link";
import { useRegisterMutation } from "@/Redux/features/auth/authApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import PoliciesModal from "@/CommonComponent/PoliciesModal";
import {
  MarketingHipaa,
  NoticeHipaa,
  PrivacyPolicy,
  TermsOfUse,
} from "@/Data/Terms&Policies";

const CommonRegisterForm = ({ alignLogo }) => {
  const [showPassWord, setShowPassWord] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this state
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [policyTitle, setPolicyTitle] = useState("");
  const router = useRouter();

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("Please enter your first name!")
      .min(2, "First name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "First name can only contain alphabets"),
    lastName: Yup.string()
      .required("Please enter your last name!")
      .min(2, "Last name must be at least 2 characters")
      .matches(/^[A-Za-z]+$/, "Last name can only contain alphabets"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    userRole: Yup.string()
      .required("User role is required!")
      .oneOf(["Patient", "Provider"], "Invalid user role"),
    npiNumber: Yup.string().test(
      "npi-required",
      "License number is required for providers",
      function (value) {
        const { userRole } = this.parent;
        if (userRole === "Provider") {
          return !!value; // Ensure NPI number is filled if role is Provider
        }
        return true; // Otherwise, it's valid
      }
    ),
    terms: Yup.bool().oneOf([true], "You must accept the terms and conditions"),
  });

  const [register, { isError, data, error, isSuccess }] = useRegisterMutation();

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
        setIsSubmitting(false); // Re-enable button on error
      }
    }
  }, [router, data?.message, isSuccess, error]);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userRole: "",
      npiNumber: "",
      terms: false,
    },
    validationSchema,
    onSubmit: async ({
      firstName,
      lastName,
      email,
      password,
      userRole,
      npiNumber,
    }) => {
      setIsSubmitting(true); // Disable the button after first click

      const data = {
        firstName,
        lastName,
        email,
        password,
        userRole,
        npiNumber,
      };
      await register(data);
    },
  });

  return (
    <div className="login-card login-dark">
      <div>
        <div>
          <CommonLogo alignLogo={alignLogo} />
        </div>
        <div className="login-main">
          <Form className="theme-form" onSubmit={formik.handleSubmit}>
            <h2 className="text-center">{CreateYourAccount}</h2>
            <p className="text-center">
              {"Enter your personal details to create account"}
            </p>
            <FormGroup>
              <Label className="pt-0">{YourName}</Label>
              <Row className="g-2">
                <Col xs="6">
                  <Input
                    type="text"
                    name="firstName"
                    placeholder={FirstName}
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    // invalid={
                    //   formik.touched.firstName && !!formik.errors.firstName
                    // }
                  />
                  {formik.touched.firstName && formik.errors.firstName ? (
                    <div className="text-danger">{formik.errors.firstName}</div>
                  ) : null}
                </Col>
                <Col xs="6">
                  <Input
                    type="text"
                    name="lastName"
                    placeholder={LastName}
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    // invalid={
                    //   formik.touched.lastName && !!formik.errors.lastName
                    // }
                  />
                  {formik.touched.lastName && formik.errors.lastName ? (
                    <div className="text-danger">{formik.errors.lastName}</div>
                  ) : null}
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Label>{EmailAddress}</Label>
              <Input
                type="email"
                name="email"
                placeholder={EmailsPlaceHolder}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                // invalid={formik.touched.email && !!formik.errors.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-danger">{formik.errors.email}</div>
              ) : null}
            </FormGroup>
            <FormGroup>
              <Label>{Password}</Label>
              <div className="form-input position-relative">
                <Input
                  type={showPassWord ? "text" : "password"}
                  name="password"
                  placeholder="*********"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // invalid={formik.touched.password && !!formik.errors.password}
                />
                <div className="show-hide">
                  <span
                    onClick={() => setShowPassWord(!showPassWord)}
                    className={!showPassWord ? "show" : ""}
                  />
                </div>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="text-danger">{formik.errors.password}</div>
              ) : null}
            </FormGroup>
            <FormGroup>
              <Label>Confirm Password</Label>
              <div className="form-input position-relative">
                <Input
                  type={showPassWord ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="*********"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // invalid={
                  //   formik.touched.confirmPassword &&
                  //   !!formik.errors.confirmPassword
                  // }
                />
                <div className="show-hide">
                  <span
                    onClick={() => setShowPassWord(!showPassWord)}
                    className={!showPassWord ? "show" : ""}
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
            <FormGroup>
              <Label>Role</Label>
              <div className="form-input position-relative">
                <Input
                  type="select"
                  name="userRole"
                  className="btn-square"
                  value={formik.values.userRole}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // invalid={formik.touched.userRole && !!formik.errors.userRole}
                >
                  <option value="">Select Role</option>
                  <option value="Patient">Client</option>
                  <option value="Provider">Provider</option>
                </Input>
              </div>
              {formik.touched.userRole && formik.errors.userRole ? (
                <div className="text-danger">{formik.errors.userRole}</div>
              ) : null}
            </FormGroup>
            {formik.values.userRole === "Provider" && (
              <FormGroup>
                <Label>License Number</Label>
                <Input
                  type="text"
                  name="npiNumber"
                  placeholder="Enter License Number"
                  value={formik.values.npiNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // invalid={
                  //   formik.touched.npiNumber && !!formik.errors.npiNumber
                  // }
                />
                {formik.touched.npiNumber && formik.errors.npiNumber ? (
                  <div className="text-danger">{formik.errors.npiNumber}</div>
                ) : null}
              </FormGroup>
            )}
            <FormGroup className="mb-0 checkbox-checked">
              <div className="checkbox-solid-info d-flex align-items-center gap-2">
                <Input
                  id="checkbox1"
                  type="checkbox"
                  name="terms"
                  checked={formik.values.terms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // invalid={formik.touched.terms && !!formik.errors.terms}
                />
                <Label for="checkbox1" className="mb-0">
                  I agree to Theryo.ai{" "}
                  <a
                    href="#"
                    onClick={() => {
                      setPolicy(TermsOfUse);
                      setPolicyTitle("Terms of Use");
                      setShowPoliciesModal(true);
                    }}
                  >
                    Terms of Use
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    onClick={() => {
                      setPolicy(PrivacyPolicy);
                      setPolicyTitle("Privacy Policy");
                      setShowPoliciesModal(true);
                    }}
                  >
                    Privacy Policy
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    onClick={() => {
                      setPolicy(NoticeHipaa);
                      setPolicyTitle("Notice Hipaa Policy");
                      setShowPoliciesModal(true);
                    }}
                  >
                    Notice HIPAA Policy
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    onClick={() => {
                      setPolicy(MarketingHipaa);
                      setPolicyTitle("HIPAA Marketing Authorization");
                      setShowPoliciesModal(true);
                    }}
                  >
                    HIPAA marketing authorization
                  </a>
                </Label>
              </div>
              {formik.touched.terms && formik.errors.terms ? (
                <div className="text-danger">{formik.errors.terms}</div>
              ) : null}
              <Button
                block
                color="primary"
                className="w-100 mt-3"
                type="submit"
                disabled={isSubmitting} // Disable the button when form is being submitted
              >
                {isSubmitting ? (
                  <i className="fa fa-spinner fa-spin"></i>
                ) : (
                  CreateAccount
                )}
              </Button>
            </FormGroup>
            <p className="mt-4 mb-0 text-center">
              {"Already have an account?"}
              <Link className="ms-2" href={`/auth/login`}>
                {SignIn}
              </Link>
            </p>
          </Form>
        </div>
      </div>
      {showPoliciesModal && (
        <PoliciesModal
          title={policyTitle}
          content={policy}
          onClose={() => setShowPoliciesModal(false)}
        />
      )}
    </div>
  );
};

export default CommonRegisterForm;
