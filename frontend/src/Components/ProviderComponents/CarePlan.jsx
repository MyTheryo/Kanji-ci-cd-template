import React, { useState, useEffect } from "react";
import { useGetCarePlanQuery } from "@/Redux/features/AI/AIApi";
import { formatViewSummary } from "@/utils/AISummariesHelpers";

const CarePlan = ({ patientId }) => {
  const { data, isLoading, error } = useGetCarePlanQuery(
    { patientId, limit: 1 }, // Pass the limit parameter as needed
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [carePlan, setCarePlan] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data?.length > 0) {
      const rawData = data[0]?.carePlan;
      const createdAt = data[0]?.createdAt;
      if (rawData && createdAt) {
        const parsed = formatViewSummary(rawData, createdAt);
        setCarePlan(parsed);
      } else {
        setCarePlan("No CarePlan Found!");
      }
    } else {
      setCarePlan("No CarePlan Found!");
    }
  }, [data]);

  //Return null if loading
  if (isLoading) {
    return null;
  }

  return (
    <>
      {!isLoading ? (
        carePlan ? (
          <div
            className=""
            dangerouslySetInnerHTML={{ __html: carePlan }}
          ></div>
        ) : (
          <div className="mt10 xl:mt-6">No Recent CarePlan Found.</div>
        )
      ) : (
        <i className="fa fa-spinner fa-spin"></i>
      )}
    </>
  );
};

export default CarePlan;
