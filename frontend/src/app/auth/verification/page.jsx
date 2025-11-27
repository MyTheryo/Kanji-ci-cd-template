"use client";
import { Col, Container, Row, Button } from "reactstrap";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useActivationMutation,
  useResendOTPMutation,
} from "@/Redux/features/auth/authApi";
import { useNewEmailVerificationMutation } from "@/Redux/features/user/userApi";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonLogo from "../../../Components/Authentication/Common/CommonLogo";
import { updateUserInfo } from "@/Redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";

const Verification = () => {
  const router = useRouter();
  const { token, user } = useSelector((state) => state.auth);
  const [activation, { isSuccess, error }] = useActivationMutation();
  const [
    newEmailVerification,
    { isSuccess: newEmailIsSuccess, error: newEmailError, data },
  ] = useNewEmailVerificationMutation();
  const [resendOTP, { isSuccess: resendSuccess, error: resendError }] =
    useResendOTPMutation();
  const [invalidError, setInvalidError] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [verifyNumber, setVerifyNumber] = useState({
    0: "",
    1: "",
    2: "",
    3: "",
  });

  const dispatch = useDispatch();
  const { update } = useSession();

  // Timer for resend otp of 5 minutes and also show in minutes and seconds

  const [time, setTime] = useState(60);
  const [isRunning, setIsRunning] = useState(true); // State to control the timer

  // convert time to minutes and seconds
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  // useEffect for timer
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // Function to reset the timer
  const resetTimer = () => {
    setTime(60); // Reset to 1 minute
    setIsRunning(true); // Start the timer
  };

  useEffect(() => {
    setVerifying(false);
    if (isSuccess) {
      toast.success("Account activated successfully");
      router.push("/auth/login");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error;
        toast.error(errorData.data.message);
        setInvalidError(true);
      } else {
        console.log("An error occurred", error);
      }
    }
  }, [router, isSuccess, error]);

  useEffect(() => {
    setVerifying(false);
    if (newEmailIsSuccess) {
      toast.success("Email Updated successfully");
      dispatch(updateUserInfo(data?.user));
      update({ user: data?.user });
      router.push("/profile");
    }
    if (newEmailError) {
      if ("data" in error) {
        const errorData = error;
        toast.error(errorData.data.message);
        setInvalidError(true);
      } else {
        console.log("An error occurred", error);
      }
    }
  }, [router, newEmailIsSuccess, newEmailError]);

  const verificationHandler = async () => {
    const verificationNumber = Object.values(verifyNumber).join("");
    if (verificationNumber.length !== 4) {
      setInvalidError(true);
      return;
    }
    setVerifying(true);
    if (user?.isUpdateEmail) {
      await newEmailVerification({
        activation_token: token,
        activation_code: verificationNumber,
      });
    } else {
      await activation({
        activation_token: token,
        activation_code: verificationNumber,
      });
    }
  };

  const resendOtpHandler = async () => {
    if (user?.email) {
      setIsLoading(true);
      await resendOTP({
        email: user?.email,
        newEmail: user?.isUpdateEmail ? user?.email : null,
        currentEmail: user?.isUpdateEmail ? user?.oldEmail : null,
      });
    } else {
      toast.error("User not found");
    }
  };

  useEffect(() => {
    setIsLoading(false);
    if (resendSuccess) {
      toast.success("OTP sent successfully");
      resetTimer();
    }
    if (resendError) {
      if (resendError.data) {
        toast.error(resendError.data.message);
      }
      console.log("An error occurred", resendError);
    }
  }, [resendSuccess, resendError]);

  const handleInputChange = (index, value) => {
    setInvalidError(false);
    if (/^\d$/.test(value)) {
      const newVerifyNumber = { ...verifyNumber, [index]: value };
      setVerifyNumber(newVerifyNumber);

      if (index < 3) {
        inputRefs[index + 1].current?.focus();
      }
    } else if (value === "") {
      const newVerifyNumber = { ...verifyNumber, [index]: "" };
      setVerifyNumber(newVerifyNumber);
      if (index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

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
                <div className="w-full d-flex align-items-center justify-content-center mb-4">
                  <h1 className="text-center">Enter Verification Code</h1>
                </div>
                <div className="m-auto d-flex align-items-center justify-content-around gap-1">
                  {Object.keys(verifyNumber).map((key, index) => (
                    <input
                      className={`text-center opt-text ${
                        invalidError ? "border-danger" : ""
                      }`}
                      style={{
                        width: "65px",
                        height: "65px",
                      }}
                      type="text"
                      key={key}
                      ref={inputRefs[index]}
                      maxLength={1}
                      value={verifyNumber[key]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                  ))}
                </div>
                <br />
                <br />
                <div className="w-full d-flex justify-content-center">
                  <Button
                    color="primary"
                    block
                    className="w-100"
                    onClick={verificationHandler}
                    disabled={verifying}
                  >
                    {verifying ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </div>
                {/* timer and button for resend otp */}
                <div className="d-flex justify-content-center mt-3">
                  <p className="text-center">
                    Didn't receive the code?{" "}
                    {time > 0 ? (
                      <span className="text-warning">
                        Resend OTP in {minutes}:{seconds}
                      </span>
                    ) : (
                      <>
                        <Button
                          onClick={resendOtpHandler}
                          color="link"
                          className="text-primary p-0 mb-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <i className="fa fa-spinner fa-spin ms-2"></i>
                          ) : (
                            "Resend OTP"
                          )}
                        </Button>
                      </>
                    )}
                  </p>
                </div>
                {!user?.isUpdateEmail && (
                  <h5 className="text-center pt-4 font-Poppins text-black dark:text-white">
                    Go back to sign up?
                    <Link
                      href={"/auth/sign-up"}
                      className="text-primary font-bold ps-2 cursor-pointer"
                    >
                      Sign Up
                    </Link>
                  </h5>
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Verification;
