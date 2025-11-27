"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  useGetCarePlanByIdQuery,
  useUpdateCarePlanMutation,
} from "@/Redux/features/AI/AIApi";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Loader from "../Loader";
import { useUnsavedChanges } from "use-unsaved-changes";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { formatViewSummary, summaryParser } from "@/utils/AISummariesHelpers";
import PdfDocument from "../PdfDocument";
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from "reactstrap";

const ViewCareplan = ({ careplanId }) => {
  const { data, error, isLoading } = useGetCarePlanByIdQuery(careplanId, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  // const [updateCarePlan] = useUpdateCarePlanMutation();
  const [updateCarePlan, {isLoading: updateCarePlanLoading}] = useUpdateCarePlanMutation();
  const { data: session } = useSession();
  const [isSigned, setIsSigned] = useState(false);
  const [editableCarePlan, setEditableCarePlan] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [carePlanSum, setCarePlanSum] = useState("");
  const { setIsDirty } = useUnsavedChanges();

  useEffect(() => {
    if (data) {
      setIsSigned(data?.isSigned);
      setEditableCarePlan(data.carePlan);
      setCarePlanSum(data.carePlan);
    }
  }, [data]);

  const handleToggleSign = () => {
    setIsSigned((prev) => !prev);
  };

  const handleCarePlanChange = (e) => {
    setEditableCarePlan(e.target.value);
    setIsDirty(true);
  };

  const handleUpdateCarePlanText = async () => {
    try {
      const updateData = {
        id: careplanId,
        carePlan: editableCarePlan,
      };
      const response = await updateCarePlan(updateData)?.unwrap();
      if (response?.success) {
        toast.success("Care Plan updated.");
        setCarePlanSum(response?.data);
        setIsEditModalOpen(false);
        setIsDirty(false);
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const handleUpdateSignedStatus = async (signedStatus) => {
    try {
      const updateData = {
        id: careplanId,
        isSigned: signedStatus,
      };
      const response = await updateCarePlan(updateData)?.unwrap();
      if (response?.success) {
        toast.success("Care Plan status updated.");
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = data.carePlan;
    navigator?.clipboard
      ?.writeText(textToCopy)
      .then(() => {
        toast.success("Care Plan copied!");
      })
      .catch(() => {
        toast.error("Something went wrong.");
      });
  };

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !data) {
    return (
      <div className="p-4 mt-3 shadow-sm border rounded">
        Care Plan Not Found
      </div>
    );
  }

  const { carePlan, createdAt } = data;
  const parsedData = summaryParser(createdAt, carePlan);

  return (
    <div className="p-4 mt-3 shadow-sm border rounded">
      <div className="d-flex justify-content-end mb-2">
        <PDFDownloadLink
          document={<PdfDocument parsedData={parsedData} date={createdAt} />}
          fileName={`CarePlan_${createdAt}.pdf`}
        >
          <Button color="secondary" title="Download PDF">
            <i className="fa fa-save"></i>
          </Button>
        </PDFDownloadLink>
        <Button color="secondary" onClick={handleCopyToClipboard} className="ms-2" title="Copy Care Plan">
          <i className="fa fa-copy"></i>
        </Button>
        <Button color="secondary" onClick={openEditModal} className="ms-2" title="Edit Care Plan">
          <i className="fa fa-pencil-square-o"></i>
        </Button>
      </div>

      <h2 className="p-2 border text-center f-w-700" style={{backgroundColor: '#fead77'}}>
        Care Plan - {format(new Date(createdAt), "MM/dd/yyyy")}
      </h2>

      <div
        dangerouslySetInnerHTML={{
          __html: formatViewSummary(carePlanSum, createdAt),
        }}
      ></div>

      <FormGroup className="mt-4 d-flex align-items-center">
        <Input
          type="checkbox"
          id="checkbox2"
          checked={isSigned}
          onChange={handleToggleSign}
        />
        <Label for="checkbox2" className="ms-2 mb-0 mt-1">
          Sign this Form. I, {session?.user?.firstName}{" "}
          {session?.user?.lastName}, Managing partner, declare this information
          to be accurate and complete.
        </Label>
      </FormGroup>

      <div className="d-flex justify-content-start mt-4">
        <Button
          color="secondary"
          disabled={!isSigned}
          onClick={() => handleUpdateSignedStatus(true)}
          className={`me-2 ${!isSigned ? "disabled" : ""}`}
        >
          Save and publish signed by author
        </Button>
        <Button
          color="secondary"
          disabled={isSigned}
          onClick={() => handleUpdateSignedStatus(false)}
          className={isSigned ? "disabled" : ""}
        >
          Save Unsigned
        </Button>
      </div>

      <Modal isOpen={isEditModalOpen} toggle={closeEditModal} size="xl">
        <ModalHeader toggle={closeEditModal}>Edit Care Plan</ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            rows="25"
            value={editableCarePlan}
            onChange={handleCarePlanChange}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" disabled={updateCarePlanLoading} onClick={closeEditModal}>
            Cancel
          </Button>
          <Button color="primary" disabled={updateCarePlanLoading} onClick={handleUpdateCarePlanText}>
            {updateCarePlanLoading ? <>Formatting <i className="fa fa-spinner fa-spin"></i></> : <>Update</>}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ViewCareplan;
