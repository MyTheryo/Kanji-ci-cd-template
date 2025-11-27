"use client";
import React, { useState } from "react";
import { Accordion, AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { PDFDownloadLink } from "@react-pdf/renderer";
import Disclaimer from "../Disclaimer";
import "font-awesome/css/font-awesome.min.css";
import ReportDocument from "@/Components/ReportAccordian/ReportDocument";
import { useFetchWeeklyReportForProviderQuery } from "@/Redux/features/report/reportApi";
import Loader from "@/Components/Loader";
import { formatViewSummary } from "@/utils/AISummariesHelpers";
import { toast } from "react-toastify";

const ProviderPatientReport = ({ patientId }) => {
  // Use the query hook to fetch the weekly report
  const { data: reportData, isLoading, error } = useFetchWeeklyReportForProviderQuery(patientId, {
    refetchOnMountOrArgChange: true,
  });

  const [dropdown, setDropDown] = useState("");

  const handleToggle = (id) => {
    setDropDown(dropdown === id ? "" : id);
  };

  const copyTextToClipboard = (html) => {
    if (!html || html === 'undefined') {
      toast.error("No text Found");
      return null;
    }

    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li\s*\/?>/gi, "\n- ")
      .replace(/<\/?[^>]+(>|$)/g, "");

    if (!navigator.clipboard) {
      toast.error("Clipboard not available");
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

  if (isLoading) return <Loader />;

  // Assuming the reportData is the "data" field from your API response, which is an array of weekly reports
  const weeklyReports = reportData?.data; 

  return (
    <div>
      {weeklyReports?.length ? (
        <Accordion open={dropdown} toggle={handleToggle}>
          {/* Iterate over the array of weekly reports */}
          {weeklyReports.map((report) => (
            <AccordionItem key={report?._id}>
              <AccordionHeader targetId={report?._id}>{`Journal Report for Week (${report?.weekRange?.split(" to ").join(" < > ")})`}</AccordionHeader>
              <AccordionBody accordionId={report?._id}>
                {/* Display the summary */}
                <div className="p-3 relative">
                  <div className="mt-4 d-flex justify-content-end gap-3">
                    {/* Copy to Clipboard */}
                    <button
                      className="btn btn-primary fa fa-copy"
                      onClick={() => copyTextToClipboard(report?.summary)}
                      title="Copy to Clipboard"
                    ></button>

                    {/* PDF Download */}
                    <PDFDownloadLink
                      document={<ReportDocument item={report} />}
                      fileName={`Weekly_Report_${report?.weekRange}.pdf`}
                    >
                      {({ loading }) =>
                        loading ? (
                          <Loader />
                        ) : (
                          <button
                            className="btn btn-primary fa fa-file-pdf-o"
                            title="Download PDF"
                          ></button>
                        )
                      }
                    </PDFDownloadLink>
                  </div>
                  {report?.summary ? (
                    <div>
                      <h2 className="border-[1px] border-black my-3 p-2 bg-primary text-white font-bold text-2xl mt-10">
                        Weekly Report
                      </h2>
                      {typeof report?.summary === "string" ? (
                        <div
                          className="mt-4"
                          dangerouslySetInnerHTML={{
                            __html: formatViewSummary(
                              report?.summary,
                              report?.createdAt,
                              false
                            ),
                          }}
                        ></div>
                      ) : (
                        <p>No weekly report available.</p>
                      )}
                      <Disclaimer />
                    </div>
                  ) : (
                    <p>No weekly report available.</p>
                  )}
                </div>
              </AccordionBody>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-center">No report data available</p>
      )}
    </div>
  );
};

export default ProviderPatientReport;
