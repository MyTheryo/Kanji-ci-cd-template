"use client";
import React, { useEffect, useState } from "react";
import { useGetUserInfoQuery } from "@/Redux/features/user/userApi";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatbotComponent from "@/Components/chatbot/ChatbotComponent";
import PropTypes from "prop-types";
import { Button } from "reactstrap";
import { LogOut } from "react-feather";
import { useLogOutMutation } from "@/Redux/features/auth/authApi"; // Assuming logOut mutation is part of your RTK Query slice
import {
  Box,
  CircularProgress,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepLabel,
  Stepper,
  styled,
  Typography,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import Loader from "@/Components/Loader";

const PatientJourney = () => {
  const { data: session, update } = useSession();
  const [logOut, { isLoading: logoutLoading, error }] = useLogOutMutation();
  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useGetUserInfoQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  const [journeyCount, setJourneyCount] = useState(1);
  const [journeyCompleted, setJourneyCompleted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDashboard = async () => {
    setLoading(true);
    try {
      const updateSession = await update({
        user: { initialJourneyCount: 12 },
      });
      if (updateSession) {
        router.push("/user/home");
      } else {
        router.push("/patient-journey");
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred while updating the session:", error);
      router.push("/patient-journey");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.user?.initialJourneyCount == 12) {
      router.push("/user/home");
    }
  }, [userData]);

  useEffect(() => {
    if (journeyCount !== userData?.user?.initialJourneyCount) {
      setJourneyCount(userData?.user?.initialJourneyCount);
    }
  }, [userData]);

  useEffect(() => {
    if (journeyCompleted) {
      setJourneyCount(journeyCount + 1);
      update({
        user: { initialJourneyCount: 12 },
      });
    }
  }, [journeyCompleted]);

  const handleLogout = async () => {
    // Call your logOut mutation to update the backend
    await logOut();
    signOut({ redirect: true, callbackUrl: "/auth/login" });
    localStorage.clear();
  };

  const QontoConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#6ac16b",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#6ac16b",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#eaeaf0",
      borderTopWidth: 3,
      borderRadius: 1,
      ...theme.applyStyles("dark", {
        borderColor: theme.palette.grey[800],
      }),
    },
  }));

  const QontoStepIconRoot = styled("div")(({ theme }) => ({
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    "& .QontoStepIcon-completedIcon": {
      color: "#6ac16b",
      zIndex: 1,
      fontSize: 25,
      fontWeight: "bold",
    },
    "& .QontoStepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          color: "#6ac16b",
        },
      },
    ],
  }));

  function QontoStepIcon(props) {
    const { active, completed, className } = props;

    return (
      <QontoStepIconRoot ownerState={{ active }} className={className}>
        {completed ? (
          <Check className="QontoStepIcon-completedIcon" />
        ) : (
          <div className="QontoStepIcon-circle" />
        )}
      </QontoStepIconRoot>
    );
  }

  QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
  };

  const ColorlibStepIconRoot = styled("div")(({ theme }) => ({
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[700],
    }),
    variants: [
      {
        props: ({ ownerState }) => ownerState.active,
        style: {
          backgroundImage:
            "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
          boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
        },
      },
      {
        props: ({ ownerState }) => ownerState.completed,
        style: {
          backgroundImage:
            "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
        },
      },
    ],
  }));

  function ColorlibStepIcon(props) {
    const { active, completed, className } = props;

    const icons = {
      1: <Check />,
      2: <Check />,
      3: <Check />,
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icons[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  ColorlibStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
    /**
     * The label displayed in the step icon.
     */
    icon: PropTypes.node,
  };

  const steps = [
    "Introduction",
    "Current Concerns",
    "Mental Health History",
    "Family and Background",
    "Health and Coping",
    "Support and Relationships",
    "Daily Life and Routines",
    "Spirituality and Values",
    "Goals and Aspirations",
    "Strengths and Resources",
    "Therapy Preferences",
  ];

  function CircularProgressWithLabel(props) {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress color="success" variant="determinate" {...props} />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              sx={{ color: "text.secondary" }}
            >
              {`${Math.round(props.value)}%`}
            </Typography>
          </Box>
        </Box>
        <div className="ms-2">
          {journeyCount && journeyCount > 0 ? (
            <>
              {journeyCount < 12 && <p>Step {journeyCount} of 11</p>}
              <span className="fw-bold">
                {journeyCount < 12 ? steps[journeyCount - 1] : "Completed"}
              </span>
            </>
          ) : (
            <>Progress</>
          )}
        </div>
      </div>
    );
  }

  CircularProgressWithLabel.propTypes = {
    /**
     * The value of the progress indicator for the determinate variant.
     * Value between 0 and 100.
     * @default 0
     */
    value: PropTypes.number.isRequired,
  };

  return (
    <div className="custam-bg h-screen d-flex flex-column">
      <div>
        <div className="p-3 gap-2 bg-primary text-white w-full">
          <div className="w-full">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="font-weight-bold text-white">
                {session?.user?.firstName &&
                  `Hello ${session?.user?.firstName}`}
              </h4>
              <div className="d-flex gap-1 mb-1">
                {(journeyCompleted || journeyCount > 11) && (
                  <Button
                    className="bg-success px-2 px-md-2 py-1 me-2"
                    onClick={handleDashboard}
                  >
                    Dashboard
                  </Button>
                )}
                <Button
                  className="bg-danger px-1 px-md-2 py-1"
                  onClick={handleLogout}
                >
                  <LogOut style={{ width: "20px" }} />
                </Button>
              </div>
            </div>
            <span className="">
              Welcome to your initial journey on <b>Theryo AI</b>, we hope you
              are having a good day!
            </span>
          </div>
        </div>

        <div className="mt-4 d-none d-lg-block">
          <Stepper
            alternativeLabel
            activeStep={journeyCount && journeyCount > 0 ? journeyCount - 1 : 0}
            connector={<QontoConnector />}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
        <div className="mt-4 d-block d-lg-none text-center">
          <CircularProgressWithLabel
            value={journeyCount ? ((journeyCount - 1) / 11) * 100 : 0}
          />
        </div>
      </div>
      <div className="px-2 px-sm-4 pb-4 flex-grow h-100 chatbotContainer">
        {/* {!isLoading && !isError && <PatientRoadmap days={days} />} */}
        {/* <PatientChatWindow journeyCompleted={journeyCompleted} setJourneyCompleted={setJourneyCompleted} /> */}
        {loading ? (
          <Loader />
        ) : (
          <ChatbotComponent
            journeyCompleted={journeyCompleted}
            setJourneyCompleted={setJourneyCompleted}
            journeyCount={journeyCount}
            setJourneyCount={setJourneyCount}
          />
        )}
      </div>
    </div>
  );
};

export default PatientJourney;
