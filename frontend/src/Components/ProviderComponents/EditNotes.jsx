"use client";
import React, { useCallback, useEffect, useState } from "react";
import NoteHeader from "./NoteHeader";
import QuillEditor from "./QuillEditor";
import Recommendation from "./Recommendation";
import { useGetSingleDocumentQuery } from "@/Redux/features/document/documentApi";
import { updateAdditionalNotes, updateNotes, updateStateAndReset } from "@/Redux/features/notes/notesSlice";
import { useDispatch, useSelector } from "react-redux";
import { useCreateNotesMutation, useEditNoteMutation, useGetSingleNoteQuery } from "@/Redux/features/notes/notesApi";
import { toast } from "react-toastify";
import PatientSummaryData from "./PatientSummaryData";
import { useGetUserInfoByIdQuery } from "@/Redux/features/user/userApi";
import Loader from "../Loader";
import PatientNotesSummary from "./PatientNotesSummary";

const EditNote = ({
  noteId,
  setShowPatientDocuments,
  patientName,
  setEditClick,
  patientId,
}) => {
  const dispatch = useDispatch();
  const { data: notesData, isLoading: noteLoading } = useGetSingleNoteQuery(noteId, {
    refetchOnMountOrArgChange: true,
  });
  const {
    data: patientInfoData,
    isLoading,
    isError,
  } = useGetUserInfoByIdQuery(patientId, { refetchOnMountOrArgChange: true, });
  const [patientData, setPatientData] = useState(null);

  const [editNote, { error, isSuccess, data: editData }] =
    useEditNoteMutation();

  const {
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
  } = useSelector((state) => state.notes);
  const notesss = useSelector((state) => state.notes);

  useEffect(() => {
    dispatch(updateStateAndReset(notesData?.note));
  }, [notesData?.note]);

  const handleEditNote = () => {
    const noteData = {
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

    editNote({ noteId, data: noteData });
  };

  useEffect(() => {
    if (patientInfoData) {
      setPatientData(patientInfoData?.user);
    }
  }, [patientInfoData]); // Only refetch data if data changes

  useEffect(() => {
    if (isSuccess) {
      toast.success("Notes updated succesfully");
      setShowPatientDocuments("document");
    }
    if (error) {
      toast.error(error);
    }
  }, [isSuccess, error]);

  const handleEditDocumentClick = () => {
    setShowPatientDocuments("edit-document");
    setEditClick("edit-click");
  };

  const handleQuillChange = useCallback(
    (value) => dispatch(updateNotes(value)),
    [dispatch]
  );

  const handleAdditionalNoteChange = useCallback(
    (value) => dispatch(updateAdditionalNotes(value)),
    [dispatch]
  );

  //Return null if loading
  if (isLoading || noteLoading) {
    return <Loader />;
  }

  return (
    <div className=" px-2 py-4">
      <NoteHeader showEdit={true} title={title} patientName={patientName} date={date}
        time={time} />
      <PatientSummaryData
        patientInfoData={patientData}
        patientId={patientId}
        handleEditDocumentClick={handleEditDocumentClick}
      />
      <div className="mb-3 mt-4">
        <QuillEditor
          value={notes}
          onChange={handleQuillChange}
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

      <h4 className="mb-0 text-primary">AI Summary</h4>
      <PatientNotesSummary patientId={patientId} />
      <hr></hr>
      <div className="text-[20px] font-[500] text-primary">Plan</div>

      <Recommendation onClick={handleEditNote} />
    </div>
  );
};

export default EditNote;
