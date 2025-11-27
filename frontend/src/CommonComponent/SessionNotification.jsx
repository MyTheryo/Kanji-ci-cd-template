import React, { useState, useEffect } from "react";
import { useIdle } from "react-use";
import { toast } from "react-toastify";
import IdleModal from "./IdleModal"; // Adjust the import path as necessary
import { signOut } from "next-auth/react"; // No need for session checking
import { useLogOutMutation } from "@/Redux/features/auth/authApi"; // Assuming logOut mutation is part of your RTK Query slice

const SessionNotification = () => {
  const [logOut, { isLoading: logoutLoading, error }] = useLogOutMutation();
  const [isActive, setIsActive] = useState(true);
  const [counter, setCounter] = useState(600); // Initial countdown for testing, set back to 300 or 600 as needed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const idle = useIdle(600000); // 10 minutes = 600000, adjust as needed

  // Trigger idle timer and open modal when idle
  useEffect(() => {
    if (idle && isActive) {
      setIsActive(false);
      setIsModalOpen(true);
      setCounter(300); // Start 5-minute countdown after idle
    }
  }, [idle, isActive]);

  // Countdown effect
  useEffect(() => {
    let timerId;

    if (isModalOpen && counter > 0) {
      timerId = setTimeout(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);
    } else if (counter === 0) {
      // Force logout when the counter reaches 0
      forceSignOut();
    }

    // Clean up the timeout when the component unmounts or counter changes
    return () => clearTimeout(timerId);
  }, [counter, isModalOpen]);

  // Clear timeout if user resumes activity
  const handleResume = () => {
    setIsActive(true);
    setCounter(300); // Reset to 5 minutes, or your desired idle time
    setIsModalOpen(false);
    toast.success("Session resumed successfully");
  };

  // Force sign out when counter reaches zero
  const forceSignOut = async () => {
    try {
      // Call your logOut mutation to update the backend
      await logOut();
      sessionStorage.removeItem("sessionActive");
      await signOut({ redirect: true, callbackUrl: "/auth/login" });
    } catch (error) {
      console.error("Automatic logout failed: ", error);
      toast.error("Failed to log out automatically. Please try again.");
    }
  };

  return (
    <div>
      <IdleModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onResume={handleResume}
        onLogout={forceSignOut}
        counter={formatTime(counter)}
      />
    </div>
  );
};

const formatTime = (counter) => {
  const minutes = Math.floor(counter / 60);
  const seconds = counter % 60;
  return `${minutes}m ${seconds < 10 ? `0${seconds}` : seconds}s`;
};

export default SessionNotification;
