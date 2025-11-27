"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetDocumentState } from "@/Redux/features/document/DocumentSlice";
import { useGetAllDocumetsQuery } from "@/Redux/features/document/documentApi";
import { useGetAllNotesQuery } from "@/Redux/features/notes/notesApi";
import { useGetAllPatientMoodQuery } from "@/Redux/features/mood/moodApi";
import {
  useCareplanItemsQuery,
  useGenerateCareplanMutation,
  useGetCarePlanQuery,
} from "@/Redux/features/AI/AIApi";
import { resetNoteState } from "@/Redux/features/notes/notesSlice";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import DataTable from "react-data-table-component";
import { Button, Modal, ModalBody, ModalHeader, ModalFooter, FormGroup, Input, Label, Form } from "reactstrap";
import { toast } from "react-toastify";
import Loader from "../Loader";
import DownloadPlan from "../DownloadPlan";

const PatientDocuments = ({ setShowPatientDocuments, patientId, setNoteId, setCareplanId }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading: documentLoading } = useGetAllDocumetsQuery(patientId, { refetchOnMountOrArgChange: true });
  const { data: notesData, isLoading: notesLoading } = useGetAllNotesQuery(patientId, { refetchOnMountOrArgChange: true });
  const { data: carePlanData, isLoading: planLoading } = useGetCarePlanQuery({ patientId }, { refetchOnMountOrArgChange: true });

  const [generateCareplan, { isLoading }] = useGenerateCareplanMutation();

  const { data: cpItems, isLoading: carePlanLoading } = useCareplanItemsQuery({ patientId }, { refetchOnMountOrArgChange: true });

  const [mergedData, setMergedData] = useState([]);
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    progressNotes: false,
    psychotherapyNotes: false,
    carePlans: {},
  });

  const handleEditClick = (id, docType) => {
    if (docType === 'note') {
      setShowPatientDocuments("edit-note");
      setNoteId(id);
    } else if (docType === 'careplan') {
      setShowPatientDocuments("view-careplan");
      setCareplanId(id);
    }
  };

  const handleCreateClick = (type) => {
    dispatch(resetDocumentState());
    dispatch(resetNoteState());
    setShowPatientDocuments(type);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSelectedItems((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCarePlanCheckboxChange = (e, carePlanKey, carePlanId) => {
    const { checked } = e.target;
    setSelectedItems((prev) => ({
      ...prev,
      carePlans: {
        ...prev.carePlans,
        [carePlanKey]: checked ? carePlanId : false,
      },
    }));
  };

  const handleSubmit = async () => {
    const selectedData = {
      patientId,
      progressNotes: selectedItems?.progressNotes,
      psychotherapyNotes: selectedItems?.psychotherapyNotes,
      carePlans: selectedItems?.carePlans,
    };

    try {
      const response = await generateCareplan(selectedData).unwrap();
      response.success ? toast.success(response?.message) : toast.error(response?.message);
      if (response?.success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to share data:", error);
    }
  };

  useEffect(() => {
    if (data && notesData && carePlanData) {
      const merged = [
        ...(data?.documents ? data?.documents?.map((doc) => ({ ...doc, type: "document" })) : []),
        ...(notesData?.notes ? notesData?.notes?.map((note) => ({ ...note, type: "note" })) : []),
        ...(carePlanData ? carePlanData?.map((plan) => ({ ...plan, type: "careplan", title: "Care Plan" })) : [])
      ];

      const sortedMerged = merged?.sort((a, b) => {
        if (a?.type === "careplan" && a?.planType === "treatment") return -1;
        if (b?.type === "careplan" && b?.planType === "treatment") return 1;
        return new Date(b?.createdAt) - new Date(a?.createdAt);
      });

      setMergedData(sortedMerged);
    }
  }, [data, notesData, carePlanData]);

  const handleSearchTermChange = (e) => setSearchTerm(e.target.value);
  const filteredData = mergedData.filter((document) =>
    document?.title?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const columns = [
    {
      name: 'Document',
      selector: (row) => row?.title,
      sortable: true,
      cell: (row) => (
        <span onClick={() => handleEditClick(row?._id, row?.type)} className="text-primary cursor-pointer" style={{ cursor: "pointer" }}>
          <i className="fa fa-file-text me-2"></i>
          {row?.title}
        </span>
      ),
    },
    {
      name: 'Service',
      selector: (row) => row?.diagnosis?.code || row?.primaryICD10Code || "",
      sortable: true,
    },
    {
      name: 'Created Date',
      selector: (row) => format(new Date(row?.createdAt), "MM-dd-yyyy"),
      sortable: true,
    },
    {
      name: 'Author',
      selector: (row) => row?.authorName || `${session?.user?.firstName} ${session?.user?.lastName}`,
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row) => (row?.isSigned ? "Signed by Author" : ""),
      sortable: true,
    },
    {
      name: 'Download',
      selector: (row) => (
        row?.title?.toLowerCase() !== 'care plan' ? (
          <PDFDownloadLink
            document={<DownloadPlan documentData={filteredData[0]} sessionData={row} />}
            fileName={`${row.title.replace(/ /g, "_")}.pdf`}
            className="text-primary"
          >
            {({ loading }) => loading ? "" : <i className="fa fa-cloud-download"></i>}
          </PDFDownloadLink>
        ) : (
          "-"
        )
      ),
    },
  ];

  if (documentLoading || notesLoading || carePlanLoading || planLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="mt-12">
        <div className="d-flex justify-content-end mb-3">
          <div className="d-flex">
            <Input
              type="text"
              className="bg-primary text-white rounded white-placeholder"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </div>
          <Button color="primary" className="ms-2" onClick={() => handleCreateClick("create-note")}>Create Session</Button>
          <Button color="primary" className="ms-2" onClick={openModal}>Create Plan</Button>
        </div>

        {isModalOpen && (
          <Modal isOpen={isModalOpen} toggle={closeModal}>
            <ModalHeader toggle={closeModal} className="text-center">Items for AI-Generated Care Plan</ModalHeader>
            <ModalBody>
              {!isLoading ? (
                <>
                  <p>Please select at least one care plan to generate a new AI-generated care plan.</p>
                  <p className="my-2 f-w-700">If no care plan is available, kindly request the patient to share their Mental Health Report. Doing so will automatically generate an initial care plan for the patient.</p>
                  <Form>
                    {cpItems?.notes?.summary && (
                      <>
                        <FormGroup check className="mb-3">
                          <Input
                            type="checkbox"
                            id="progressNotes"
                            name="progressNotes"
                            checked={selectedItems?.progressNotes}
                            onChange={handleCheckboxChange}
                          />
                          <Label for="progressNotes">PROGRESS NOTE (CLINICAL NOTE) {new Date(cpItems?.notes?.createdAt)?.toLocaleDateString()}</Label>
                        </FormGroup>
                        <FormGroup check className="mb-3">
                          <Input
                            type="checkbox"
                            id="psychotherapyNotes"
                            name="psychotherapyNotes"
                            checked={selectedItems?.psychotherapyNotes}
                            onChange={handleCheckboxChange}
                          />
                          <Label for="progressNotes">PSYCHOTHERAPY NOTE (PROCESS NOTE) {new Date(cpItems?.notes?.createdAt)?.toLocaleDateString()}</Label>
                        </FormGroup>
                      </>
                    )}
                    {cpItems?.carePlans?.length > 0 && cpItems?.carePlans.map((plan, index) => (
                      <FormGroup check className="mb-3" key={plan._id}>
                        <Input
                          type="checkbox"
                          id={`carePlan${index}`}
                          name={`carePlan${index}`}
                          checked={selectedItems?.carePlans[`carePlan${index}`] || false}
                          onChange={(e) => handleCarePlanCheckboxChange(e, `carePlan${index}`, plan?._id)}
                        />
                        <Label for={`carePlan${index}`}>Care Plan {new Date(plan?.createdAt)?.toLocaleDateString()}</Label>
                      </FormGroup>
                    ))}
                  </Form>
                </>
              ) : (
                <>
                  <h3 className="mb-3">Creating a Personalized Care Plan</h3>
                  <p>Your Client&apos;s comprehensive care plan is being carefully crafted. This process may take a few minutes as our AI analyzes, combines, and compiles extensive data to ensure the plan is tailored and actionable.</p>
                  <p>Thank you for your patience!</p>
                  <i className="fa fa-spinner fa-spin mt-2"></i>
                </>
              )}
            </ModalBody>
            {!isLoading && <ModalFooter>
              <Button color="primary" onClick={handleSubmit} disabled={isLoading}>Generate CarePlan</Button>
            </ModalFooter>}
          </Modal>
        )}

        {filteredData.length > 0 ? (
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
          />
        ) : (
          <p className="text-center mt-4">No documents yet</p>
        )}
      </div>
    </>
  );
};

export default PatientDocuments;
