"use client";
import React, { useEffect, useState } from "react";
import Loader from "@/Components/Loader";
import { useGetSharedSummariesQuery } from "@/Redux/features/AI/AIApi";
import { formatViewSummary } from "@/utils/AISummariesHelpers";
import { Card, CardBody } from "reactstrap";
import SimpleAccordion from "../Accordian/SimpleAccordion/SimpleAccordion";

const SharedSummaries = ({ providerId }) => {
  const { data, isLoading } = useGetSharedSummariesQuery(providerId, {
    refetchOnMountOrArgChange: true,
  });

  const [sharedSummaries, setSharedSummaries] = useState([]);

  useEffect(() => {
    if (data) {
      const accordianData = data
        .filter(
          (summary) =>
            // summary?.summaryTableName === "sevenday-sums" ||
            summary?.summaryTableName === "aipt-sums" ||
            summary?.summaryTableName === "AIP-PT-Chat" ||
            summary?.summaryTableName === "ij-emailtemplates" ||
            summary?.summaryTableName === "therapist-profiles"
        )
        .map((summary, index) => {
          return {
            id: index,
            title:
              // summary?.summaryTableName === "sevenday-sums"
              //   ? "Latest 7 Days Summary"
              //   :
              summary?.summaryTableName === "aipt-sums"
                ? "Mental Health Report"
                : summary?.summaryTableName === "AIP-PT-Chat"
                ? "Initial Journey Chat History"
                : summary?.summaryTableName === "ij-emailtemplates"
                ? "Therapeutic Request Email Template"
                : summary?.summaryTableName === "therapist-profiles"
                ? "Target Therapist Profile"
                : "N/A",
            content:
              summary?.summaryTableName !== "AIP-PT-Chat"
                ? formatViewSummary(summary?.summary, summary?.createdAt)
                : summary?.summary,
          };
        });

      setSharedSummaries(accordianData);
    }
  }, [data]);

  //Return null if loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Card>
        <CardBody>
          {sharedSummaries && sharedSummaries.length > 0 ? (
            <SimpleAccordion acdata={sharedSummaries} />
          ) : (
            ""
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default SharedSummaries;
