import React, { useState, useEffect } from "react";
import { useGetPatientNotesSummaryMutation } from "@/Redux/features/AI/AIApi"; // Adjust the import to match your API slice
import { formatViewSummary } from "@/utils/AISummariesHelpers";

const PatientNotesSummary = ({ patientId }) => {
  const [getPatientNotesSummary, { isLoading, isError, error }] =
    useGetPatientNotesSummaryMutation();
  const [patientNotesData, setPatientNotesData] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getPatientNotesSummary({ patientId });
        const summaries = response?.data?.data?.summary;

        if (summaries && summaries[0]?.heading) {
          setPatientNotesData(summaries);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const toggleNotesSummary = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  const getChevronIcon = (isOpen) => {
    return isOpen ? (
      <i className="fa fa-chevron-down"></i>
    ) : (
      <i className="fa fa-chevron-right"></i>
    );
  };

  return (
    <div className="patient-notes-summary px-2">
      {isError && <p>{error.message}</p>}
      {!isLoading ? (
        Array.isArray(patientNotesData) && patientNotesData?.length > 0 ? (
          <div>
            {patientNotesData?.map((item, index) => (
              <div key={index} className="card p-1 mt-2">
                <div
                  role="button"
                  className="d-flex align-items-center text-primary font-bold p-2"
                  onClick={() => toggleNotesSummary(index)}
                >
                  {getChevronIcon(openDropdownIndex === index)}
                  <span className="mx-2 text-primary font-bold">
                    {item?.heading.replace(/[#*]/g, "")}
                  </span>{" "}
                  {/* Adjust based on your data structure */}
                </div>
                {openDropdownIndex === index && (
                  <div className="profile-card mt-3 ">
                    <div
                      className="p-3"
                      dangerouslySetInnerHTML={{
                        __html: formatViewSummary(item?.content),
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No data available</p>
        )
      ) : (
        <i className="fa fa-spinner fa-spin"></i>
      )}
    </div>
  );
};

export default PatientNotesSummary;
