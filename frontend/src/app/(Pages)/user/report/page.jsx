"use client";
import React, { useEffect } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Card, CardBody } from "reactstrap";
import SimpleAccordion from "@/Components/ReportAccordian/SimpleAccordion/SimpleAccordion";
import { useGetMoodReportByFourWeeksQuery } from "@/Redux/features/mood/moodApi";
import Loader from "@/Components/Loader";

const ReportPage = () => {
  // Fetch the report data (four-week data)
  const {
    data: fourWeekReportData,
    isLoading,
    refetch,
  } = useGetMoodReportByFourWeeksQuery({ refetch: true });

  useEffect(() => {
    refetch(); // Refetch the data whenever this component is mounted or re-rendered
  }, [refetch]);

  if (isLoading) {
    return <Loader />; // Display loading state if data is still loading
  }

  // Parse and prepare accordion data
  const accordionListReport = fourWeekReportData?.data?.map(
    (weekData, index) => ({
      id: `${index + 1}`,
      title: `Journal Report for Week (${weekData?.weekRange.replace(
        " to ",
        " <> "
      )})`,
      content:
        weekData?.weeklyReportSummary?.summary ||
        "No report available for this week.",
      weekData, // Pass the whole week data to the accordion
    })
  );

  return (
    <div>
      <Breadcrumbs mainTitle={"Historical Recurring Reports"} parent={"User"} />
      <Card>
        <CardBody>
          <SimpleAccordion refetch={refetch} acdata={accordionListReport} />
        </CardBody>
      </Card>
    </div>
  );
};

export default ReportPage;
