import { EmailAddress } from "../../Constant";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import CommonLogo from "./Common/CommonLogo";
import { useResetPasswordMutation } from "@/Redux/features/auth/authApi";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const [resetPassword, { error, isSuccess, data }] =
    useResetPasswordMutation();

  const SimpleForgotHandle = (event) => {
    event.preventDefault();
    resetPassword({ email });
  };
  useEffect(() => {
    if (isSuccess) {
      toast.success(
        "Please check your email and click on the Reset Password Link"
      );
      router.push("/auth/login");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error;
        toast.error(errorData.data.message);
      }
    }
  }, [isSuccess, error, router]);
  return (
    <div>
      <div>
        <CommonLogo />
      </div>
      <div className="login-main">
        <Form className="theme-form" onSubmit={(e) => SimpleForgotHandle(e)}>
          <h2 className="text-center">Forgot Password</h2>
          <p className="text-center">
            {
              "Enter your email address that you used to register. We'll send you an email with a link to reset your password."
            }
          </p>
          <FormGroup>
            <Label className="col-form-label">{EmailAddress}</Label>
            <Input
              type="email"
              required
              placeholder="Test@gmail.com"
              value={email}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </FormGroup>

          <FormGroup className="mb-0 checkbox-checked">
            <div className="text-end mt-3">
              <Button color="primary" block className="w-100">
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

export default Forgot;
