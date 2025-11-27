"use client";
import React, { useState, useEffect } from "react";
import { AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { toast } from "react-toastify";
import { useGetInviteDoctorQuery } from "@/Redux/features/user/userApi";
import Loader from "@/Components/Loader";
import Disclaimer from "@/Components/Disclaimer";
import "font-awesome/css/font-awesome.min.css"; // Ensure this is available
import { useSession } from "next-auth/react";
import Image from "next/image";
import ReportDocument from "@/Components/ReportAccordian/ReportDocument";

import { useShareSummaryMutation } from "@/Redux/features/AI/AIApi";

const CommonAccordionItem = ({ item, generateSummaryForWeek }) => {
  const { data: invitedDoctors } = useGetInviteDoctorQuery({ refetch: true });
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const defaultImg = "/assets/images/profile.jpg";

  const [
    shareSummary,
    {
      isLoading: shareLoading,
      isError: shareError,
      data: shareData,
      isSuccess: shareSuccess,
    },
  ] = useShareSummaryMutation();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const copyTextToClipboard = (html) => {
    const text = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<li\s*\/?>/gi, "\n- ")
      .replace(/<\/?[^>]+(>|$)/g, ""); // Strips HTML tags

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Text Copied to Clipboard!");
      })
      .catch((err) => {
        toast.error("Error Copying Text");
      });
  };

  const handleShare = async (providerEmail) => {
    if (providerEmail) {
      try {
        await shareSummary({
          doctorEmail: providerEmail, // Use doctorEmail passed from map function
          summaryTableName:
            // item?.title === "Latest 7 Days Summary"
            //   ? "sevenday-sums"
            //   :
            item?.title === "Mental Health Report"
              ? "aipt-sums"
              : item?.title === "Therapeutic Request Email Template"
              ? "ij-emailtemplates"
              : item?.title === "Target Therapist Profile"
              ? "therapist-profiles"
              : item?.title === "Initial Journey Chat History"
              ? "AIP-PT-Chat"
              : null,
        });
        setShowShareDropdown(false); // Close dropdown after sharing
      } catch (error) {
        toast.error("Failed to share report. Please try again.");
      }
    } else {
      toast.error("Please select a provider");
    }
  };

  useEffect(() => {
    if (shareSuccess && shareData?.message) {
      // Display success message from backend
      if (shareData.message == "Summary Already Shared.") {
        toast.warn(shareData.message);
      } else {
        toast.success(shareData.message);
      }
    }

    if (shareError) {
      // Extract error message from backend
      const errorMessage =
        shareError?.data?.message || "Error sharing weekly report.";
      toast.error(errorMessage);
    }
  }, [shareSuccess, shareData, shareError]);

  if (loading || shareLoading) {
    return <Loader />; // Add a loading spinner or message
  }

  return (
    <AccordionItem>
      <AccordionHeader targetId={item?.id}>{item?.title}</AccordionHeader>
      <AccordionBody accordionId={item?.id}>
        {session?.user?.userRole !== "Provider" && (
          <div className="mt-4 d-flex justify-content-end gap-3">
            {/* Copy to Clipboard */}
            {item?.title !== "Initial Journey Chat History" && (
              <div className="d-flex justify-content-end gap-3">
                <button
                  className="btn btn-primary fa fa-copy mb-2"
                  onClick={() => copyTextToClipboard(item.content)}
                  title="Copy to Clipboard"
                ></button>
                {/* PDF Download */}
                <PDFDownloadLink
                  document={<ReportDocument item={item} />}
                  fileName={`${item.title}-Summary.pdf`}
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
            )}
            {/* Share */}
            <button
              className="btn btn-primary fa fa-share mb-2"
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              title="Share"
            ></button>
            {/* Share Modal Dropdown */}
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
                            <>
                              <div
                                className="dropdown-item"
                                key={doctor.doctorEmail}
                                onClick={() => handleShare(doctor.doctorEmail)}
                                style={{ cursor: "pointer" }}
                                onMouseEnter={(e) =>
                                  e.currentTarget.classList.add("text-primary")
                                }
                                onMouseLeave={(e) =>
                                  e.currentTarget.classList.remove(
                                    "text-primary"
                                  )
                                }
                                onMouseDown={(e) =>
                                  e.currentTarget.classList.add("bg-light")
                                }
                                onMouseUp={(e) =>
                                  e.currentTarget.classList.remove("bg-light")
                                }
                              >
                                <strong>
                                  {doctor.doctorName || doctor.doctorEmail}
                                </strong>
                                <p className="text-muted">
                                  ID: {doctor.customerId || "Not Available"}
                                </p>
                              </div>
                            </>
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
        )}

        {item?.title === "Initial Journey Chat History" && (
          <div className="relative">
            <div className="">
              <div
                className="mx-auto p-3 overflow-y-scroll"
                style={{ maxHeight: "60vh" }}
              >
                {item?.content && item?.content?.length > 0 ? (
                  item?.content?.map((chat, index) =>
                    chat.type === "human" ? (
                      <div
                        className="d-flex align-items-start mb-4 justify-content-end"
                        key={index}
                      >
                        <div className="bg-primary p-3 rounded shadow">
                          <p
                            className="text-white"
                            dangerouslySetInnerHTML={{
                              __html: chat.data.content.replace(/\n/g, "<br>"),
                            }}
                          ></p>
                        </div>
                        <Image
                          src={
                            session?.user?.userRole == "Provider"
                              ? defaultImg
                              : session?.user?.avatar?.url || defaultImg
                          }
                          width={40}
                          height={40}
                          alt="user"
                          className="cursor-pointer rounded-5 object-contain ms-3"
                        />
                      </div>
                    ) : (
                      <div
                        className="d-flex align-items-start mb-4"
                        key={index}
                      >
                        <img
                          src={"/assets/icon-192x192.png"}
                          width={40}
                          height={40}
                          alt="user"
                          className="cursor-pointer rounded-5 object-contain me-3 bg-dark"
                        />
                        <div className="bg-white p-3 rounded shadow">
                          <p
                            className="text-gray"
                            dangerouslySetInnerHTML={{
                              __html: chat.data.content.replace(/\n/g, "<br>"),
                            }}
                          ></p>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p>No chat history available.</p>
                )}
              </div>
            </div>
            <Disclaimer />
          </div>
        )}

        {item?.title === "Target Therapist Profile" && (
          <div className="p-3 relative">
            {item?.content ? (
              <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
            ) : (
              <div className="mt-4">No Target Therapist Profile Found.</div>
            )}
            <Disclaimer />
          </div>
        )}
        {item?.title === "Therapeutic Request Email Template" && (
          <div className="p-3 relative">
            {item?.content ? (
              <div>
                <h5 className="border border-black my-3 p-2 bg-primary text-white font-bold  mt-10">
                  Email Template for Potential Therapists:
                </h5>
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>
              </div>
            ) : (
              <div className="mt-4">
                No Theraputic Request Email Template Found.
              </div>
            )}
            <Disclaimer />
          </div>
        )}
        {item?.title === "Mental Health Report" && (
          <div className="p-3 relative">
            {item?.content ? (
              <div>
                <h5 className="border border-black my-3 p-2 bg-primary text-white font-bold  mt-10">
                  Initial Journey Assessment
                </h5>
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: item?.content }}
                ></div>
              </div>
            ) : (
              <div className="mt-4 ">No Mental Health Report Found.</div>
            )}
            <Disclaimer />
          </div>
        )}
        {/* {item?.title === "Latest 7 Days Summary" && (
          <div className="p-3 relative">
            {item?.content ? (
              <div>
                <h5 className="border border-black my-3 p-2 bg-primary text-white font-bold  mt-10">
                  Journal Summary
                </h5>
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: item?.content }}
                ></div>
              </div>
            ) : (
              <div className="mt-4">No Latest Seven Days Summary Found.</div>
            )}
            <Disclaimer />
          </div>
        )} */}
      </AccordionBody>
    </AccordionItem>
  );
};

export default CommonAccordionItem;
