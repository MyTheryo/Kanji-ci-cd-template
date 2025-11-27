"use client";
import React, { useState, useEffect } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Card, CardBody } from "reactstrap";
import SimpleAccordion from "../../../../Components/Accordian/SimpleAccordion/SimpleAccordion";

//AI Generated Summary Code
import { formatViewSummary } from "@/utils/AISummariesHelpers";
import {
  useGetConversationMutation,
  useGenerateJourneySummaryMutation,
  useGetSevenDaySummaryMutation,
  useGetIJEmailTempMutation,
  useTherapistProfileMutation,
} from "@/Redux/features/AI/AIApi";
import Loader from "@/Components/Loader";
const page = () => {
  //AI Generated Summary Code

  const [getConversation, { isLoading: conversationLoading }] =
    useGetConversationMutation();
  const [
    generateJourneySummary,
    { data, error, isLoading: mentalHealthReportLoading },
  ] = useGenerateJourneySummaryMutation();
  // const [getSevenDaySummary, { isLoading: sevenDaySummaryLoading }] =
  //   useGetSevenDaySummaryMutation();
  const [getIJEmailTemp, { isLoading: emailTemplateLoading }] =
    useGetIJEmailTempMutation();
  const [getTherapistProfile, { isLoading: therapistProfileLoading }] =
    useTherapistProfileMutation();

  const [chatHistory, setChatHistory] = useState([]);
  const [onboardingSummary, setOnboardingSummary] = useState("");
  // const [sevenDaySummary, setSevenDaySummary] = useState("");
  const [IJEmailSummary, setIJEmailSummary] = useState("");
  const [therapistProfile, setTherapistProfile] = useState("");

  const aiSummaryData = [
    { id: 1, title: "Initial Journey Chat History", content: chatHistory },
    { id: 2, title: "Target Therapist Profile", content: therapistProfile },
    {
      id: 3,
      title: "Therapeutic Request Email Template",
      content: IJEmailSummary,
    },
    // { id: 4, title: "Latest 7 Days Summary", content: sevenDaySummary },
    { id: 4, title: "Mental Health Report", content: onboardingSummary },
  ];

  useEffect(() => {
    async function fetchData() {
      const getChatHistory = await getConversation();
      setChatHistory(getChatHistory.data);
      const getOnboardingSummary = await generateJourneySummary().unwrap();
      let onboardingSummary = getOnboardingSummary?.data?.summary;
      let formattedOnboarding = onboardingSummary
        ? formatViewSummary(
            onboardingSummary,
            getOnboardingSummary?.data?.createdAt,
            false
          )
        : "";
      setOnboardingSummary(formattedOnboarding);

      // const get7daySummary = await getSevenDaySummary().unwrap();
      // let sevDaySum = get7daySummary?.data?.summary;
      // let formattedSevenDay = sevDaySum
      //   ? formatViewSummary(sevDaySum, get7daySummary?.data?.createdAt, false)
      //   : "";
      // setSevenDaySummary(formattedSevenDay);

      const IJESummary = await getIJEmailTemp().unwrap();
      let IJEmailSum = IJESummary?.data?.template;
      let formattedIJEmail = IJEmailSum
        ? formatViewSummary(IJEmailSum, IJESummary?.data?.createdAt, false)
        : "";
      setIJEmailSummary(formattedIJEmail);

      const therapistProfile = await getTherapistProfile().unwrap();
      let tp = therapistProfile?.data?.therapistProfile;
      let formattedtp = tp
        ? formatViewSummary(tp, therapistProfile?.data?.createdAt)
        : "";
      setTherapistProfile(formattedtp);
    }

    fetchData();
  }, [
    generateJourneySummary,
    getConversation,
    getIJEmailTemp,
    // getSevenDaySummary,
    getTherapistProfile,
  ]);

  if (
    conversationLoading ||
    mentalHealthReportLoading ||
    // sevenDaySummaryLoading ||
    emailTemplateLoading ||
    therapistProfileLoading
  ) {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"AI Generated Summaries"} parent={"User"} />
      <Card>
        <CardBody>
          <SimpleAccordion acdata={aiSummaryData} />
        </CardBody>
      </Card>
    </div>
  );
};

export default page;
