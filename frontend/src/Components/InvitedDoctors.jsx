"use client";
import React, {
  useMemo,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input, Label, Button } from "reactstrap";
import DataTable from "react-data-table-component";
import {
  useGetInviteDoctorQuery,
  useUpdateDoctorInvitationStatusMutation,
} from "@/Redux/features/user/userApi";
import { useDeletePatientInvitationMutation } from "@/Redux/features/provider/providerApi";
import { toast } from "react-toastify";
import Loader from "@/Components/Loader";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { decodeBase64 } from "@/utils/helpers";

const InvitedDoctors = forwardRef((props, ref) => {
  // Fetch invited doctors from the API
  const {
    data: invitedDoctors,
    isLoading,
    refetch,
  } = useGetInviteDoctorQuery({
    refetchOnMountOrArgChange: true,
  });

  useImperativeHandle(ref, () => ({
    refetch,
  }));

  const [selectedValues, setSelectedValues] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mutation for updating doctor invitation status
  const [updateDoctorStatus] = useUpdateDoctorInvitationStatusMutation();
  // Mutation for deleting a provider
  const [deletePatientInvitation] = useDeletePatientInvitationMutation();

  useEffect(() => {
    refetch();
  }, [invitedDoctors]);

  // Handle dropdown change for accepting/rejecting
  const handleSelectChange = async (status, id) => {
    if (status === "") {
      return;
    }
    if (!id || status.trim() === "") {
      console.error("Invalid ID or empty status");
      return;
    }

    setSelectedValues((prevState) => ({
      ...prevState,
      [id]: status,
    }));

    await updateDoctorStatus({ newStatus: status, id });
    toast.success(`Provider status updated to ${status}`);
    refetch(); // Refetch data after updating
  };

  // Handle delete/disconnect functionality
  const handleDelete = async (doctorId) => {
    try {
      const response = await deletePatientInvitation({ id: doctorId });
      if (response?.data) {
        toast.success("Provider deleted successfully.");
        refetch();
      } else {
        toast.error("Failed to delete Invitation.");
      }
    } catch (error) {
      toast.error("Failed to delete Provider.");
    }
    setOpenModal(false);
  };

  // Open confirmation modal for deleting provider
  const openConfirmationModal = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setOpenModal(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setOpenModal(false);
    setSelectedDoctorId(null);
  };

  // Handle disconnect or reject invitation
  const handleDisableClick = (doctorData) => {
    openConfirmationModal(
      doctorData?.invitationId || doctorData?.patientInvitationId
    );
  };

  // Filter doctors based on search input
  const filteredDoctors = invitedDoctors?.data?.filter(
    (doctor) =>
      doctor?.invitationStatus !== "deleted" &&
      doctor?.doctorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered doctors
  const paginatedDoctors = filteredDoctors?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Memoized subHeaderComponent for filtering
  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div className="dataTables_filter d-flex align-items-center">
        <Label className="m-0 me-2">Search:</Label>
        <Input
          onChange={(e) => setSearchQuery(e.target.value)}
          type="search"
          value={searchQuery}
          placeholder="Search By Name"
        />
      </div>
    );
  }, [searchQuery]);

  // Define columns for DataTable
  const columnsProvider = [
    {
      name: "#",
      selector: (row, i) => i + 1 + page * rowsPerPage,
      width: "70px",
    },
    {
      name: "Provider Name",
      selector: (row) => row.doctorName || "Provider Name",
      sortable: true,
      compact: true,
    },
    {
      name: "Provider ID",
      selector: (row) => decodeBase64(row?.customerId) || "N/A",
      sortable: true,
      compact: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <div
          className={`w-fit px-2 py-1 rounded text-white ${
            row.invitationStatus === "accepted"
              ? "bg-success"
              : row.invitationStatus === "rejected"
              ? "bg-danger"
              : "bg-warning" // This will display orange color for any other status
          }`}
        >
          {row.invitationStatus.charAt(0).toUpperCase() +
            row.invitationStatus.slice(1)}
        </div>
      ),
      compact: true,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2 align-items-center">
          {row.getInvited === "recieveInvitation" ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              {row.invitationStatus === "accepted" ||
              row.invitationStatus === "rejected" ? (
                <div
                  onClick={() => {
                    if (row.invitationStatus === "accepted") {
                      toast.error(
                        "This action is disabled because the user is already Accepted."
                      );
                    } else {
                      toast.error("This user is Rejected by provider.");
                    }
                  }}
                  style={{ cursor: "not-allowed" }}
                >
                  <Input
                    type="select"
                    name="acceptance"
                    className="btn-square"
                    style={{ pointerEvents: "none", minWidth: "99px" }} // Make the input ignore pointer events
                    disabled
                  >
                    <option value="">Select</option>
                  </Input>
                </div>
              ) : (
                <Input
                  type="select"
                  name="acceptance"
                  className="btn-square"
                  style={{
                    cursor: "pointer",
                    minWidth: "99px",
                  }}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, row.patientInvitationId)
                  }
                >
                  <option value="">Select</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                </Input>
              )}
            </div>
          ) : (
            <div className="bg-primary px-2 py-1 rounded text-white position-relative">
              Client invited Provider
            </div>
          )}
          <Button
            className="btn btn-danger btn-sm flex-grow-1 text-nowrap"
            onClick={() => handleDisableClick(row)}
            // disabled={row.invitationStatus === "accepted"} // Disable the button if status is "accepted"
          >
            Remove
          </Button>
        </div>
      ),
      width: "225px",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <DataTable
        columns={columnsProvider}
        data={paginatedDoctors}
        pagination
        paginationRowsPerPageOptions={[5, 10, 25]}
        paginationTotalRows={filteredDoctors?.length || 0}
        paginationPerPage={rowsPerPage}
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
        onChangePage={(newPage) => setPage(newPage - 1)}
        onChangeRowsPerPage={(currentRowsPerPage) => {
          setRowsPerPage(currentRowsPerPage);
          setPage(0);
        }}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        highlightOnHover
        striped
        persistTableHead
        responsive
      />

      <Modal isOpen={openModal} toggle={closeConfirmationModal}>
        <ModalHeader toggle={closeConfirmationModal}>
          Disconnect Confirmation
        </ModalHeader>
        <ModalBody>Are you sure you want to Remove this Provider?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={closeConfirmationModal}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => handleDelete(selectedDoctorId)}
          >
            Confirm Remove
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
});

export default InvitedDoctors;
