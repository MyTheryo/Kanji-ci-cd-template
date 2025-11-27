import React, { useState, useEffect } from "react";
import { AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { useGetInviteDoctorQuery } from "@/Redux/features/user/userApi";
import Loader from "@/Components/Loader";
import Disclaimer from "@/Components/Disclaimer";
import { formatViewSummary } from "@/utils/AISummariesHelpers";
import "font-awesome/css/font-awesome.min.css";
import { useGenerateWeeklyReportMutation } from "@/Redux/features/mood/moodApi";
import { useShareWeeklyReportMutation } from "@/Redux/features/report/reportApi";
import ReportDocument from "../ReportDocument";

const CommonAccordionItem = ({ item, refetch }) => {
  const { data: invitedDoctors } = useGetInviteDoctorQuery({ refetch: true });
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // UseMutation for generating weekly report
  const [
    generateWeeklyReport,
    {
      isError: reportError,
      isLoading: reportLoading,
      data: reportData,
      isSuccess: reportSuccess,
    },
  ] = useGenerateWeeklyReportMutation();

  // UseMutation for sharing the report
  const [
    shareWeeklyReport,
    {
      isLoading: shareLoading,
      isError: shareError,
      data: shareData,
      isSuccess: shareSuccess,
    },
  ] = useShareWeeklyReportMutation();

  const generateSummaryForWeek = async (weekRange) => {
    if (!weekRange) {
      return toast.error("Invalid date range for generating report.");
    }

    const [startDateStr, endDateStr] = weekRange.split(" to ");
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (!startDate || !endDate) {
      return toast.error(
        "Invalid date range. Please select a valid date range."
      );
    }

    const today = new Date();

    // Check if today's date is less than or equal to the end date
    if (today <= endDate) {
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return toast.error(
        `Cannot generate report yet. ${daysLeft} working days left.`
      );
    }

    const requestData = {
      startDate: startDateStr,
      endDate: endDateStr,
    };

    try {
      toast.success("Generating weekly report...");
      await generateWeeklyReport(requestData);
      refetch();
    } catch (error) {
      toast.error("Error generating report. Please try again.");
    }
  };

  const copyTextToClipboard = (html) => {
    if (!html || html === "undefined") {
      toast.error("No text Found");
      return null;
    }

    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li\s*\/?>/gi, "\n- ")
      .replace(/<\/?[^>]+(>|$)/g, "");

    if (!navigator.clipboard) {
      toast.error("No text Found");
      return null;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Text Copied");
      })
      .catch((err) => {
        toast.error("Error Copying Text");
      });
  };

  // Handle Share Logic
  const handleShare = async (doctorEmail, weekRange) => {
    if (doctorEmail && weekRange) {
      try {
        const [startDateStr, endDateStr] = weekRange.split(" to ");
        const weeklyReportTableName = `Weekly Report (${startDateStr} < > ${endDateStr})`; // Concatenate weekRange to weeklySharedReport

        await shareWeeklyReport({
          doctorEmail: doctorEmail, // Use doctorEmail passed from map function
          weeklyReportTableName, // Pass the concatenated table name with weekRange
        });

        setShowShareDropdown(false); // Close dropdown after sharing
        refetch(); // Refetch the data after sharing
      } catch (error) {
        toast.error("Failed to share report. Please try again.");
      }
    } else {
      toast.error("Please select a provider.");
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (reportSuccess && reportData?.message) {
      // Display success message from backend
      toast.success(reportData.message);
      refetch(); // Refetch data after successful report generation
    }

    if (reportError) {
      // Extract error message from backend
      const errorMessage =
        reportError?.data?.message ||
        "Failed to generate the report. Please try again.";
      toast.error(errorMessage);
    }
  }, [reportSuccess, reportData, reportError, refetch]);

  useEffect(() => {
    if (shareSuccess && shareData?.message) {
      // Display success message from backend
      toast.success(shareData.message);
    }

    if (shareError) {
      // Extract error message from backend
      const errorMessage =
        shareError?.data?.message || "Error sharing weekly report.";
      toast.error(errorMessage);
    }
  }, [shareSuccess, shareData, shareError]);

  if (loading || reportLoading || shareLoading) {
    return <Loader />;
  }

  return (
    <AccordionItem>
      <AccordionHeader targetId={item.id}>{item.title}</AccordionHeader>
      <AccordionBody accordionId={item.id}>
        <div className="mt-4 d-flex justify-content-end gap-3">
          {!item?.weekData?.weeklyReportSummary && (
            <div className="text-center mr-2">
              <button
                className="btn btn-primary fa fa-print"
                onClick={() =>
                  generateSummaryForWeek(item?.weekData?.weekRange)
                }
                title="Generate Report"
              >
                Generate Report
              </button>
            </div>
          )}

          {item?.weekData?.weeklyReportSummary && (
            <>
              <button
                className="btn btn-primary fa fa-copy"
                onClick={() => copyTextToClipboard(item.content)}
                title="Copy to Clipboard"
                disabled={!item?.weekData?.weeklyReportSummary} // Disable button if no weekly report summary
              ></button>

              <PDFDownloadLink
                document={<ReportDocument item={item} />}
                fileName={`Week-${item.id}-Report.pdf`}
              >
                {({ loading }) =>
                  loading ? (
                    "Loading PDF..."
                  ) : (
                    <button
                      className="btn btn-primary fa fa-file-pdf-o"
                      title="Download PDF"
                      disabled={!item?.weekData?.weeklyReportSummary} // Disable button if no weekly report summary
                    ></button>
                  )
                }
              </PDFDownloadLink>

              <button
                className="btn btn-primary fa fa-share"
                onClick={() => setShowShareDropdown(!showShareDropdown)}
                title="Share"
                disabled={!item?.weekData?.weeklyReportSummary} // Disable button if no weekly report summary
              ></button>
            </>
          )}

          {showShareDropdown && (
            <div className="modal fade show d-block" role="dialog">
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header justify-content-between">
                    <h5 className="modal-title">Select Provider</h5>
                    <button
                      type="button"
                      className="btn-danger close"
                      onClick={() => setShowShareDropdown(false)}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div
                    className="modal-body"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {invitedDoctors?.data?.length > 0 ? (
                      invitedDoctors.data
                        .filter(
                          (doctor) => doctor.invitationStatus === "accepted"
                        ) // Only accepted doctors
                        .map((doctor) => (
                          <div
                            className="dropdown-item"
                            key={doctor.doctorEmail}
                            onClick={() =>
                              handleShare(
                                doctor.doctorEmail,
                                item?.weekData?.weekRange
                              )
                            } // Pass doctorEmail and weekRange to handleShare
                            style={{ cursor: "pointer" }}
                            onMouseEnter={(e) =>
                              e.currentTarget.classList.add("text-primary")
                            }
                            onMouseLeave={(e) =>
                              e.currentTarget.classList.remove("text-primary")
                            }
                            onMouseDown={(e) =>
                              e.currentTarget.classList.add("bg-light")
                            }
                            onMouseUp={(e) =>
                              e.currentTarget.classList.remove("bg-light")
                            }
                          >
                            <strong>
                              {doctor.doctorName} || {doctor.doctorEmail}
                            </strong>
                            <p className="text-muted">
                              {doctor.npiNumber || "NPI Number not available"}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="dropdown-item">No Providers Found</div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setShowShareDropdown(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {item?.weekData?.weeklyReportSummary ? (
          <div>
            <h2 className="border-[1px] border-black my-3 p-2 bg-primary text-white font-bold text-2xl mt-10">
              Weekly Report
            </h2>
            {typeof item.weekData?.weeklyReportSummary?.summary === "string" ? (
              <div
                className="mt-4"
                dangerouslySetInnerHTML={{
                  __html: formatViewSummary(
                    item.weekData?.weeklyReportSummary?.summary,
                    item.weekData?.weeklyReportSummary?.createdAt,
                    false
                  ),
                }}
              ></div>
            ) : (
              <p>No valid summary available.</p>
            )}
            <Disclaimer />
          </div>
        ) : (
          <p>No weekly report available.</p>
        )}
      </AccordionBody>
    </AccordionItem>
  );
};

export default CommonAccordionItem;
