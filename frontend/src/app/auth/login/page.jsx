"use client";
import {
  Col,
  Container,
  Row,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import CommonModal from "@/CommonComponent/Common/CommonModal";
import { useState, useEffect } from "react";
import {
  CreateAccount,
  DoNotAccount,
  EmailAddress,
  ForgotPassword,
  Password,
  RememberPassword,
  SignIn,
  SignInAccount,
} from "../../../Constant";
import CommonLogo from "../../../Components/Authentication/Common/CommonLogo";
import PoliciesModal from "@/CommonComponent/PoliciesModal";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import Gleap from "gleap";
import Link from "next/link";
import { toast } from "react-toastify";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TermsOfUse } from "@/Data/Terms&Policies";
import Loader from "@/Components/Loader";
import { useDispatch } from "react-redux";
import { userActivation } from "@/Redux/features/auth/authSlice";
import { useResendOTPMutation } from "@/Redux/features/auth/authApi";
import AnthropicChart from "@/Components/AnthropicChart";

const schema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email"),
  password: Yup.string().required("Please enter your password!"),
});

const Login = () => {
  const [show, setShow] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermOfUse, setShowTermOfUse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [approvedUserModal, setApprovedUserModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [rssData, setRssData] = useState([]);
  const [showRSSModal, setShowRSSModal] = useState(false);
  const [open, setOpen] = useState("0");

  const toggle = (id) => (open === id ? setOpen() : setOpen(id));

  const [resendOTP, { isSuccess: resendSuccess, error: resendError }] =
    useResendOTPMutation();

  const dispatch = useDispatch();

  const router = useRouter();
  const handleCheckboxChange = () => {
    setAgreedToTerms(!agreedToTerms); // Toggle the state variable
  };

  const scrapeRSSFeed = async () => {
    try {
      const response = await axios.get(
        "https://status.anthropic.com/history.rss"
      );
  
      // Parse RSS XML data
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, "text/xml");
  
      // Get today's month name and day
      const today = new Date();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const todayMonth = monthNames[today.getMonth()];
      const todayDay = today.getDate(); // Get today's day as a number
  
      const items = Array.from(xmlDoc.querySelectorAll("item"))
        .map((item) => {
          try {
            const title = item.querySelector("title")?.textContent || "No Title";
            const descriptionElement = item.querySelector("description");
            const descriptionHTML =
              descriptionElement?.textContent || "No Description";
  
            // Pass both title and description to splitByTimestamp
            const allStatusUpdates = splitByTimestamp(title, descriptionHTML);
  
            // Filter updates for today based on month and day
            const todayStatusUpdates = allStatusUpdates.filter((update) => {
              const [month, day] = update.timestamp.split(/[\s,]+/);
              return month === todayMonth && parseInt(day) === todayDay;
            });
  
            return {
              title,
              statusUpdates: todayStatusUpdates,
              pubDate: item.querySelector("pubDate")?.textContent || "No Date",
            };
          } catch (error) {
            console.error("Error parsing item:", error, item);
            return null; // Skip this item
          }
        })
        .filter(Boolean); // Remove null items
  
      const todayData = items.flatMap((item) => item.statusUpdates);
  
      if (todayData && todayData.length > 0) {
        setRssData(todayData);
        setShowRSSModal(true);
      } else {
        // toast.warn("No incident report for today.");
        setRssData(todayData);
        setShowRSSModal(true);
      }
    } catch (error) {
      // console.error("Error fetching RSS feed:", error);
      toast.error("Failed to fetch RSS feed.");
    }
  };
  
  // Helper function to split updates by paragraph
  const splitByTimestamp = (title, description) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(description, "text/html");
    const paragraphs = doc.querySelectorAll("p");
    const statusUpdates = [];
  
    paragraphs.forEach((paragraph) => {
      const timestampElement = paragraph.querySelector("small");
      const statusElement = paragraph.querySelector("strong");
  
      const timestampText = timestampElement?.textContent?.trim() || "No Timestamp";
      const statusText = statusElement?.textContent?.trim() || "No Status";
      const messageText = paragraph.textContent
        .replace(timestampText, "")
        .replace(statusText, "")
        .trim();
  
      // Add all entries, regardless of timestamp
      statusUpdates.push({
        title, // Include the title in each status update
        timestamp: timestampText, // Keep the original timestamp text
        status: statusText,
        message: messageText,
      });
    });
  
    return statusUpdates;
  };
  
  const redirect = async (session) => {
    // Set a session-active flag in sessionStorage for tracking login status
    sessionStorage.setItem("sessionActive", "true");
    // Define a default user homepage URL
    const userURL = "/user/home";
    // Check if the application is running in production mode
    const isProduction = process.env.NODE_ENV === "production";
    try {
      // Validate the session object and user data
      if (!session?.user) {
        toast.error("Session data not found.");
        return; // Exit early if session data is invalid
      }
      // Destructure necessary properties from the session object
      const { userRole, initialJourneyCount } = session.user;
      // Redirect users based on their roles
      switch (userRole) {
        case "Provider":
          // Redirect to provider home page
          if (isProduction) {
            window.location.href = "/provider/home";
          } else {
            await router.push("/provider/home");
          }
          break;
        case "Admin":
          // Redirect to admin users management page
          if (isProduction) {
            window.location.href = "/admin/all-users";
          } else {
            await router.push("/admin/all-users");
          }
          break;
        case "Patient":
          // For patients, check their journey progress
          if (initialJourneyCount < 12) {
            // Redirect to the patient journey page if count is less than 12
            await router.push("/patient-journey");
          } else {
            // Redirect to user homepage otherwise
            if (isProduction) {
              window.location.href = userURL;
            } else {
              await router.push(userURL);
            }
          }
          break;
        default:
          // Handle unknown roles with a fallback route
          await router.push("/auth/login");
          break;
      }
    } catch (error) {
      // Log errors during redirection for debugging purposes
      // console.error("Redirection failed for user role:", session?.user?.userRole, error);
    } finally {
      // Uncomment if using a loader to handle UI state during redirection
      // setShowLoader(false);
    }
  };

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ email, password }) => {
      setIsLoading(true);
      const encodedPassword = btoa(password);
      signIn("credentials", {
        email: email,
        password: encodedPassword,
        redirect: false,
      }).then(async (callback) => {
        setIsLoading(false);
        if (callback?.error?.toLowerCase() === "user not approved by admin") {
          setApprovedUserModal(true);
        }

        if (callback?.ok) {
          toast.success("Login Successful");
          setShowLoader(true);
          const session = await getSession();
          if (session?.user) {
            Gleap.identify(session.user._id || "userId", {
              name: session.user.firstName || "Logged User",
              email: session.user.email || "email@domain.com",
            });
            redirect(session);
          } else {
            // Set loader to false if session is not loaded
            setShowLoader(false);
            toast.error("Failed to retrieve session data.");
          }
        }

        if (callback?.error) {
          toast.error(callback.error || "Something went wrong");
          if (callback?.error?.toLowerCase() === "account not verified") {
            dispatch(userActivation({ user: { email } }));
            setIsSending(true);
            await resendOTP({ email });
          }
        }
      });
    },
  });

  useEffect(() => {
    setIsSending(false);
    if (resendSuccess) {
      toast.success("OTP sent successfully, check you email!");
      router.push("/auth/verification");
    }
    if (resendError) {
      if (resendError.data) {
        toast.error(resendError.data.message);
      }
      console.log("An error occurred", resendError);
    }
  }, [resendSuccess, resendError]);

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <Container fluid className="p-0">
      {isSending && (
        <div
          className="position-absolute top-50 d-flex flex-column align-items-center bg-primary p-3 rounded gap-2"
          style={{ zIndex: 1, left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <i className="fa fa-spinner fa-spin fs-2"></i>
          <h5 className="text-white text-center">Sending Verification Code</h5>
        </div>
      )}
      {showLoader ? (
        <Loader />
      ) : (
        <Row className="m-0">
          <Col xs="12" className="p-0">
            <div className="login-card">
              <div>
                <div>
                  <CommonLogo />
                  <p className="mt-4 mb-2 text-center">
                    AI Service
                    <button
                      className="ms-2 btn btn-primary"
                      onClick={scrapeRSSFeed}
                    >
                      Status
                    </button>
                  </p>
                </div>
                <div className="login-main">
                  <Form className="theme-form" onSubmit={handleSubmit}>
                    <h3 className="text-center">{SignInAccount}</h3>
                    <p className="text-center">
                      {"Sign up to join the waitlist."}
                    </p>
                    <FormGroup>
                      <Label className="col-form-label">{EmailAddress}</Label>
                      <Input
                        type="email"
                        placeholder="Test@gmail.com"
                        value={values.email}
                        onChange={handleChange}
                        name="email"
                      />
                    </FormGroup>
                    {errors.email && touched.email && (
                      <span className="text-danger block">{errors.email}</span>
                    )}
                    <FormGroup>
                      <div className="d-flex justify-content-between align-items-center">
                        <Label className="col-form-label">{Password}</Label>
                        <Link
                          className="text-end"
                          href={`/auth/forgot-password`}
                        >
                          {ForgotPassword}
                        </Link>
                      </div>

                      <div className="form-input position-relative">
                        <Input
                          type={show ? "text" : "password"}
                          placeholder="*********"
                          name="password"
                          autocomplete="current-password"
                          value={values.password}
                          onChange={handleChange}
                        />
                        <div
                          className="show-hide"
                          onClick={() => setShow(!show)}
                        >
                          <span className={show ? "" : "show"}></span>
                        </div>
                      </div>
                    </FormGroup>

                    {errors.password && touched.password && (
                      <span className="text-danger mb-2 block">
                        {errors.password}
                      </span>
                    )}
                    <FormGroup className="mb-0 checkbox-checked">
                      <div className="form-check checkbox-solid-info">
                        <div className="d-flex">
                          <Input
                            type="checkbox"
                            id="termsAndConditions"
                            className="mr-2"
                            checked={agreedToTerms}
                            onChange={handleCheckboxChange}
                          />

                          <a
                            href="#"
                            className="text-muted ms-2"
                            htmlFor="termsAndConditions"
                            onClick={() => setAgreedToTerms(!agreedToTerms)}
                          >
                            {RememberPassword}
                          </a>
                          <a
                            href="#"
                            className="text-primary underline mx-1"
                            onClick={() => setShowTermOfUse(true)}
                          >
                            Terms & Condition
                          </a>
                        </div>
                      </div>
                      <div className="text-end mt-3">
                        <Button
                          disabled={!agreedToTerms | isLoading}
                          color="primary"
                          block
                          className="w-100"
                        >
                          {isLoading ? (
                            <i className="fa fa-spinner fa-spin"></i>
                          ) : (
                            SignIn
                          )}
                        </Button>
                      </div>
                    </FormGroup>
                    {showTermOfUse && (
                      <PoliciesModal
                        content={TermsOfUse}
                        title="Terms of Use"
                        onClose={() => setShowTermOfUse()}
                      />
                    )}
                    <p className="mt-4 mb-0 text-center">
                      {DoNotAccount}
                      <Link className="ms-2" href={`/auth/sign-up`}>
                        {CreateAccount}
                      </Link>
                    </p>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* RSS Feed Modal rendering logic */}
      {showRSSModal && (
        <CommonModal
          centered
          isOpen={showRSSModal}
          toggle={() => setShowRSSModal(false)}
          width={"70%"}
        >
          <div className="p-1">
            <h2 className="mb-2">AI Service Status </h2>
            <Button
              color="danger"
              onClick={() => setShowRSSModal(false)}
              className="btn-sm position-absolute top-0 end-0 mt-2 me-2 mb-2"
            >
              X
            </Button>
            <div
              style={{
                maxHeight: "70vh", // Limit height to 70% of viewport height
                minWidth: "300px",
                overflowY: "auto", // Enable vertical scrolling
                paddingRight: "10px", // Add padding to avoid content overlap with scrollbar
              }}
            >
              <AnthropicChart rssData={rssData} />
            </div>
          </div>
        </CommonModal>
      )}

      <CommonModal
        centered
        isOpen={approvedUserModal}
        toggle={() => setApprovedUserModal(false)}
      >
        <div className="modal-toggle-wrapper">
          <Button
            color="danger"
            className="btn-sm position-absolute top-0 end-0 mt-1 me-1"
            onClick={() => setApprovedUserModal(false)}
          >
            X
          </Button>
          <h2 className="text-center text-primary fw-bold my-4">
            Thanks for your interest in Theryo!
          </h2>
          <div>
            <p className="mb-2">
              You&apos;re on our waitlist for beta access. We&apos;re carefully
              expanding our user base to ensure a great experience for everyone.
            </p>
            <p className="mb-2">
              We&apos;ll reach out as soon as a spot opens up. In the meantime,
              keep an eye on your email for updates and tips on AI supported
              mental wellness.
            </p>
            <p className="mb-2">
              We appreciate your patience and commitment to mental health.
            </p>
            <p className="mb-2 fw-bold text-primary text-center">Team Theryo</p>
          </div>
        </div>
      </CommonModal>
    </Container>
  );
};

export default Login;