"use client";
import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import PatientRoadmap from "@/app/components/PatientRoadmap";
// import PatientChatWindow from "@/app/components/PatientChatWindow";
import { useGetUserInfoQuery } from "@/Redux/features/user/userApi";
// import { useLogOutMutation } from "@/redux/features/auth/authApi";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
// import ChatbotComponent from "@/app/components/chatbot/ChatbotComponent";
// import { FaSpinner } from "react-icons/fa6";

const AdminDashboard = () => {
  const { data: session, update } = useSession();
  // const { user } = useSelector((store) => store.auth);
  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useGetUserInfoQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });

  const initialJourneyCount = userData?.user?.initialJourneyCount;
  // const [days, setDays] = useState(initialJourneyCount);
  const [journeyCompleted, setJourneyCompleted] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    signOut({ redirect: true, callbackUrl: "/auth/login" });
    localStorage.clear();
  };

  return (
    <div className="custam-bg h-screen d-flex flex-column">
      <div className="p-4 py-md-8 gap-2 bg-primary text-white d-flex flex-column flex-md-row justify-content-between align-items-center w-100">
        hello dashboard
      </div>
    </div>
  );
};

export default AdminDashboard;
