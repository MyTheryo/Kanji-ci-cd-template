import React, { useState } from "react";
import {
  Button,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Collapse,
} from "reactstrap";
import { useGetAllDocumetsQuery } from "@/Redux/features/document/documentApi";
import { format } from "date-fns";
import CarePlan from "./CarePlan";
import SevenDaySummary from "./SevenDaySummary";
import PatientNotesSummary from "./PatientNotesSummary";
import Loader from "../Loader";

const PatientSummaryData = ({
  patientInfoData,
  patientId,
  handleEditDocumentClick,
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showCarePlan, setCarePlan] = useState(false);
  const [showJournalSummary, setJournalSummary] = useState(false);
  const [showNotesSummary, setNotesSummary] = useState(false);

  const { data: patientDocData, isLoading } = useGetAllDocumetsQuery(
    patientId,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setCarePlan(false);
    setJournalSummary(false);
    setNotesSummary(false);
  };

  const toggleCarePlan = () => {
    setCarePlan(!showCarePlan);
    setShowProfile(false);
    setJournalSummary(false);
    setNotesSummary(false);
  };

  // const toggleJournalSummary = () => {
  //   setJournalSummary(!showJournalSummary);
  //   setCarePlan(false);
  //   setNotesSummary(false);
  //   setShowProfile(false);
  // };

  const toggleNotesSummary = () => {
    setNotesSummary(!showNotesSummary);
    setCarePlan(false);
    setShowProfile(false);
    setJournalSummary(false);
  };

  const getChevronIcon = (isOpen) => {
    return isOpen ? (
      <i className="fa fa-chevron-down"></i>
    ) : (
      <i className="fa fa-chevron-right"></i>
    );
  };

  // Return null if loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="patient-summary mb-10">
      {/* Profile Section */}
      <Card className="mt-3">
        <CardHeader onClick={toggleProfile} className="cursor-pointer">
          <div className="text-primary bg-white border-0 font-bold d-flex align-items-center">
            {getChevronIcon(showProfile)}
            <span className="mx-2 fs-5">Client Information</span>
          </div>
        </CardHeader>
        <Collapse isOpen={showProfile}>
          <CardBody>
            <Row>
              <Col lg="3" md="6" sm="12" className="mb-3">
                <p>
                  <strong>Legal Name:</strong>{" "}
                  {patientInfoData?.firstName || ""}{" "}
                  {patientInfoData?.lastName || "N/A"}
                </p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {patientInfoData?.dateOfBirth
                    ? format(
                        new Date(patientInfoData?.dateOfBirth.split("T")[0]),
                        "MM-dd-yyyy"
                      )
                    : "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {patientInfoData?.address || "N/A"}
                </p>
                <p>
                  <strong>Time Zone:</strong>{" "}
                  {patientInfoData?.timeZone || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {patientInfoData?.phoneNumber || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {patientInfoData?.email || "N/A"}
                </p>
              </Col>
              <Col lg="3" md="6" sm="12" className="mb-3">
                <p>
                  <strong>Administrative Sex:</strong>{" "}
                  {patientInfoData?.administrativeSex || "N/A"}
                </p>
                <p>
                  <strong>Gender Identity:</strong>{" "}
                  {patientInfoData?.genderIdentity || "N/A"}
                </p>
                <p>
                  <strong>Sexual Orientation:</strong>{" "}
                  {patientInfoData?.sexualOrientation || "N/A"}
                </p>
                <p>
                  <strong>Race:</strong> {patientInfoData?.race || "N/A"}
                </p>
              </Col>
              <Col lg="3" md="6" sm="12" className="mb-3">
                <p>
                  <strong>Ethnicity:</strong>{" "}
                  {patientInfoData?.ethnicity || "N/A"}
                </p>
                <p>
                  <strong>Languages:</strong>{" "}
                  {patientInfoData?.languages || "N/A"}
                </p>
                <p>
                  <strong>Marital Status:</strong>{" "}
                  {patientInfoData?.maritalStatus || "N/A"}
                </p>
                <p>
                  <strong>Employment:</strong>{" "}
                  {patientInfoData?.employmentStatus || "N/A"}
                </p>
              </Col>
              <Col lg="3" md="6" sm="12" className="mb-3">
                <p>
                  <strong>Religious Affiliation:</strong>{" "}
                  {patientInfoData?.religiousAffiliation || "N/A"}
                </p>
                <p>
                  <strong>HIPPA:</strong>{" "}
                  {patientInfoData?.signedHipaaNpp === "ON"
                    ? "Enabled"
                    : "Disabled"}
                </p>
                <p>
                  <strong>PCP Release:</strong>{" "}
                  {patientInfoData?.pcpRelease || "N/A"}
                </p>
                <p>
                  <strong>Smoking Status:</strong>{" "}
                  {patientInfoData?.smokingStatus || "N/A"}
                </p>
              </Col>
            </Row>
          </CardBody>
        </Collapse>
      </Card>

      {/* Care Plan Section */}
      <Card className="mt-3">
        <CardHeader onClick={toggleCarePlan} className="cursor-pointer">
          <div className="text-primary bg-white border-0 font-bold d-flex align-items-center">
            {getChevronIcon(showCarePlan)}
            <span className="mx-2 fs-5">Care Plan</span>
          </div>
        </CardHeader>
        <Collapse isOpen={showCarePlan}>
          <CardBody>
            <CarePlan patientId={patientId} />
          </CardBody>
        </Collapse>
      </Card>

      {/* 7-Day Journal Section */}
      {/* <Card className="mt-3">
        <CardHeader onClick={toggleJournalSummary} className="cursor-pointer">
          <div className="text-primary bg-white border-0 font-bold d-flex align-items-center">
            {getChevronIcon(showJournalSummary)}
            <span className="mx-2 fs-5">7-Day Journal Summary</span>
          </div>
        </CardHeader>
        <Collapse isOpen={showJournalSummary}>
          <CardBody>
            <SevenDaySummary patientId={patientId} />
          </CardBody>
        </Collapse>
      </Card> */}

      {/* AI Summary Section */}
      <Card className="mt-3">
        <CardHeader onClick={toggleNotesSummary} className="cursor-pointer">
          <div className="text-primary bg-white border-0 font-bold d-flex align-items-center">
            {getChevronIcon(showNotesSummary)}
            <span className="mx-2 fs-5">AI Summary of Previous Session</span>
          </div>
        </CardHeader>
        <Collapse isOpen={showNotesSummary}>
          <CardBody>
            <PatientNotesSummary patientId={patientId} />
          </CardBody>
        </Collapse>
      </Card>
    </div>
  );
};

export default PatientSummaryData;
