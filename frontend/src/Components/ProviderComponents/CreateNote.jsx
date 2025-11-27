"use client";
import React, { useCallback, useEffect, useState } from "react";
import { updateAdditionalNotes, updateAIsummary, updateNotes } from "@/Redux/features/notes/notesSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateNotesMutation,
  useGenerateAISummaryMutation,
  useGetAllNotesQuery,
} from "@/Redux/features/notes/notesApi";
import { toast } from "react-toastify";
import { useGetUserInfoByIdQuery } from "@/Redux/features/user/userApi";
import Loader from "../Loader";
import NoteHeader from "./NoteHeader";
import PatientSummaryData from "./PatientSummaryData";
import QuillEditor from "./QuillEditor";
import Recommendation from "./Recommendation";
import PatientNotesSummary from "./PatientNotesSummary";
import { Button } from "reactstrap";
import { formatViewSummary } from "@/utils/AISummariesHelpers";

const CreateNote = ({
  patientId,
  setShowPatientDocuments,
  patientName,
  setEditClick,
}) => {
  const dispatch = useDispatch();
  const [toggleNote, setToggleNote] = useState(false);
  const [lastNote, setLastNote] = useState("");
  const {
    data: patientInfoData,
    isLoading,
    isError,
  } = useGetUserInfoByIdQuery(patientId);
  const [patientData, setPatientData] = useState(null);
  const [createNotes, { error, isSuccess }] = useCreateNotesMutation();
  const [generateAISummary, { isLoading: AIsummaryLoading }] = useGenerateAISummaryMutation();
  const { data: notesData } = useGetAllNotesQuery(patientId, {
    refetchOnMountOrArgChange: true,
  });

  const {
    title,
    date,
    time,
    duration,
    service,
    notes,
    additionalNotes,
    AIsummary,
    recommendation,
    frequency,
    isSigned,
  } = useSelector((state) => state.notes);

  useEffect(() => {
    if (patientInfoData) {
      setPatientData(patientInfoData?.user);
    }
  }, [patientInfoData]);

  const handleCreateNote = useCallback(() => {
    const data = {
      patientId,
      title,
      date,
      time,
      duration,
      service,
      notes,
      additionalNotes,
      recommendation,
      frequency,
      isSigned,
    };
    createNotes(data);
  }, [
    createNotes,
    patientId,
    title,
    date,
    time,
    duration,
    service,
    notes,
    additionalNotes,
    recommendation,
    frequency,
    isSigned,
  ]);

  const handleGenerateAISummary = async () => {
    try {
      const summaryData = {
        patientId: patientId,
        notes: notes,
        additionalNotes: additionalNotes,
      };
      const response = await generateAISummary(summaryData)?.unwrap();
      if (response?.success) {
        toast.success("AI Summary Generated");
        handleAIsummary(response?.AIsummary || '');
        // setCarePlanSum(response?.data);
        // setIsEditModalOpen(false);
        // setIsDirty(false);
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const handleNoteChange = useCallback(
    (value) => {
      dispatch(updateNotes(value));
    },
    [dispatch]
  );

  const handleAdditionalNoteChange = useCallback(
    (value) => {
      dispatch(updateAdditionalNotes(value));
    },
    [dispatch]
  );

  const handleAIsummary = useCallback(
    (value) => {
      dispatch(updateAIsummary(value));
    },
    [dispatch]
  );

  useEffect(() => {
    if (isSuccess) {
      toast.success("Notes created successfully");
      setShowPatientDocuments("document");
    }
    if (error) {
      toast.error("Notes not created, please try again.");
    }
  }, [isSuccess, error, setShowPatientDocuments]);

  const handleToggleNote = useCallback(() => {
    setToggleNote((prev) => !prev);
  }, []);

  useEffect(() => {
    if (toggleNote && notesData?.notes?.length > 0) {
      const latestNote = notesData?.notes[notesData?.notes?.length - 1]?.notes;
      const strippedNote = latestNote?.replace(/<[^>]*>?/gm, "");
      setLastNote(strippedNote || "");
    } else {
      setLastNote("");
    }
  }, [toggleNote, notesData]);

  const handleEditDocumentClick = useCallback(() => {
    setShowPatientDocuments("edit-document");
    setEditClick("create-click");
  }, [setShowPatientDocuments, setEditClick]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="px-2 py-4">
      <NoteHeader
        showEdit={true}
        title={title}
        patientName={patientName}
        date={date}
        time={time}
      />
      <PatientSummaryData
        patientInfoData={patientData}
        patientId={patientId}
        handleEditDocumentClick={handleEditDocumentClick}
      />
      <div className="mb-3 mt-4">
        <QuillEditor
          value={notes}
          onChange={handleNoteChange}
          title={"Transcript"}
        />
      </div>
      <div className="mb-3 mt-4">
        <QuillEditor
          value={additionalNotes}
          onChange={handleAdditionalNoteChange}
          title={"Additional Therapist Notes"}
        />
      </div>
      <hr></hr>

      <div className="">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0 text-primary">AI Summary</h4>

          <Button color="primary" className="d-flex align-items-center" onClick={handleGenerateAISummary} disabled={!notes || !additionalNotes}>
            {
              AIsummaryLoading ?
                <>
                  <i class="fa fa-spinner fa-spin me-2" aria-hidden="true"></i> Generating
                </> :
                <>
                  <i class="fa fa-refresh me-2" aria-hidden="true"></i> Generate
                </>
            }
          </Button>
        </div>

        {/* <textarea
          className="form-control"
          rows="5"
          placeholder="AI summary will appear here..."
          value={AIsummary}
          disabled
        ></textarea> */}
        <div
          className="p-3 border"
          dangerouslySetInnerHTML={{
            __html: formatViewSummary(AIsummary) || 'AI summary will appear here...',
          }}
        ></div>
      </div>

      {/* 
      <PatientNotesSummary patientId={patientId} /> */}

      <div
        className="w-full ml-2 flex justify-end gap-1 my-2 px-10 py-1 rounded cursor-pointer"
        onClick={handleToggleNote}
      >
        <h3>
          <i className="fa fa-angle-double-down"></i>
          {toggleNote ? " Hide" : " Show"} Previous Note
        </h3>
      </div>
      {toggleNote && (
        <div className="card ml-2 mb-4 p-3">
          <h3 className="text-primary">Previous Note</h3>
          <p className="border rounded p-2 mt-1">{lastNote}</p>
        </div>
      )}
      <Recommendation onClick={handleCreateNote} />
    </div>
  );
};

export default CreateNote;
