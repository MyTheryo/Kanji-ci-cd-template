"use client";
import React, { useEffect, useMemo } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import {
  Card,
  CardBody,
  Col,
  Row,
  Container,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { useState } from "react";
import DataTable from "react-data-table-component";
import {
  useGetAllPatientsQuery,
  useUpdatePatientStatusMutation,
  useDeletePatientInvitationMutation,
} from "@/Redux/features/provider/providerApi";
import { toast } from "react-toastify";
import Link from "next/link";
import Loader from "@/Components/Loader";
import AddClientModal from "@/Components/ProviderComponents/AddClientModal";
import { decodeBase64 } from "@/utils/helpers";

const page = () => {
  const [filteredRows, setFilteredRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [invitationId, setInvitationId] = useState(null);
  const [status, setStatus] = useState(null);
  const { data, isLoading, refetch } = useGetAllPatientsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );
  const [updatePatientStatus, { isSuccess, error }] =
    useUpdatePatientStatusMutation();

  const [
    deletePatientInvitation,
    { isSuccess: deleteSuccess, error: deleteError },
  ] = useDeletePatientInvitationMutation();

  useEffect(() => {
    if (data) {
      const transformedData = data?.patients?.map((item, index) => ({
        ...item,
        Sr: index + 1,
      }));
      setFilteredRows(
        transformedData?.filter((item) => item?.invitationStatus !== "deleted")
      );
      refetch();
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Status updated successfully");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  const deleteClient = async () => {
    await deletePatientInvitation({ id: invitationId });
    refetch();
    setOpenModal(false);
    setStatus(null);
    setInvitationId(null);
  };

  useEffect(() => {
    if (deleteSuccess) {
      refetch();
      toast.success("Client removed successfully");
    } else if (deleteError) {
      toast.error("Failed to remove client");
    }
  }, [deleteSuccess, deleteError]);

  const cancel = () => {
    setOpenModal(false);
    setStatus(null);
    setInvitationId(null);
  };

  const handleSelectChange = async (status, invitationId) => {
    if (status?.trim() !== "" && invitationId) {
      await updatePatientStatus({ newStatus: status, id: invitationId });
      refetch();
    } else {
      console.log("Status cannot be empty");
    }
  };

  const handlePendingClick = () => {
    toast.error("This user's invitation status is pending.");
  };

  const [centred, setCentered] = useState(false);
  const centeredToggle = () => setCentered(!centred);

  const handleDisableClick = (doctorData) => {
    setStatus("deleted");
    if (doctorData?.invitationId) {
      setInvitationId(doctorData?.invitationId);
    } else {
      setInvitationId(doctorData?.patientinvitationId);
    }
    setOpenModal(true);
  };

  const columns = [
    {
      name: "Client Name",
      cell: (row) =>
        row?.invitationStatus?.toLowerCase !== "deleted" &&
        (row?.invitationStatus?.toLowerCase === "rejected" &&
        row?.senderId !== undefined ? (
          <span
            className="text-gray-400"
            style={{ cursor: "not-allowed" }}
            onClick={() =>
              toast.error(
                "This user is Rejected. Please accept the user first."
              )
            }
          >
            {row?.firstName}
          </span>
        ) : row?.invitationStatus === "pending" ? (
          <span
            className="text-muted"
            style={{ cursor: "not-allowed" }}
            onClick={handlePendingClick}
          >
            {row?.firstName}
          </span>
        ) : row?.getInvited === "sendInvitation" && !row?.senderId ? (
          <span className="text-gray-400" style={{ cursor: "not-allowed" }}>
            {row?.firstName} {row?.lastName}
          </span>
        ) : (
          <Link
            className="f-w-600"
            href={`/provider/patient-overview/${row?.senderId}`}
          >
            {row?.firstName} {row?.lastName}
          </Link>
        )),
      sortable: true,
    },
    {
      name: "Client ID",
      selector: (row) =>
        decodeBase64(row?.patientId) || decodeBase64(row?.doctorId) || "N/A",
      sortable: true,
      width: "90px",
      compact: true,
    },
    {
      name: "Client Email",
      selector: (row) => row?.email,
      sortable: true,
      grow: 2,
      compact: true,
    },
    {
      name: "Phone",
      selector: (row) => row?.phoneNumber || "N/A",
    },
    {
      name: "Status",
      selector: (row) =>
        row?.invitationStatus?.toLowerCase() === "accepted" ? (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-success">
              {row?.invitationStatus}
            </span>
          </h5>
        ) : row?.invitationStatus?.toLowerCase() === "rejected" ? (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-danger">
              {row?.invitationStatus}
            </span>
          </h5>
        ) : (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-warning">
              {row?.invitationStatus}
            </span>
          </h5>
        ),
      compact: true,
      width: "90px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-1 align-items-center">
          {row?.getInvited === "recieveInvitation" ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Check for accepted or rejected status */}
              {row.invitationStatus === "accepted" ||
              row.invitationStatus === "rejected" ? (
                <div
                  onClick={() => {
                    // Show toast error messages based on the status
                    if (row.invitationStatus === "accepted") {
                      toast.error(
                        "This action is disabled because the client invitation is already Accepted."
                      );
                    } else {
                      toast.error(
                        "This client invitation is Rejected by the provider."
                      );
                    }
                  }}
                  style={{ cursor: "not-allowed" }}
                >
                  <Input
                    type="select"
                    name="acceptance"
                    className="btn-square"
                    style={{
                      pointerEvents: "none", // Prevent user interaction
                      minWidth: "98px",
                    }}
                    disabled
                  >
                    <option value="">Select</option>
                  </Input>
                </div>
              ) : (
                // If not accepted or rejected, render a functional dropdown
                <Input
                  type="select"
                  name="acceptance"
                  className="btn-square"
                  style={{ minWidth: "98px" }}
                  onChange={(e) =>
                    handleSelectChange(e.target.value, row?.invitationId)
                  }
                >
                  <option value="">Select</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                </Input>
              )}
            </div>
          ) : (
            <span className="bg-primary px-2 py-1 rounded text-white">
              Provider Invited Client
            </span>
          )}

          {/* Remove Button */}
          <Button
            className="btn btn-danger btn-sm flex-grow-1 text-nowrap"
            onClick={() => handleDisableClick(row)}
            // disabled={row.invitationStatus === "accepted"} // Disable the button if status is "accepted"
          >
            Remove
          </Button>
        </div>
      ),
      width: "220px",
    },
  ];

  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const filteredItems = filteredRows.filter((item) => {
    const matchesFilterText = item?.firstName
      ?.toLowerCase()
      ?.includes(filterText.toLowerCase());
    const matchesStatusFilter =
      statusFilter === "ALL" ||
      item?.invitationStatus?.toLowerCase() === statusFilter?.toLowerCase();
    return matchesFilterText && matchesStatusFilter;
  });
  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div
        id="basic-1_filter"
        className="dataTables_filter client-dt-filter d-flex align-items-center justify-content-between w-100"
      >
        <div className="d-flex">
          <Button
            color={statusFilter === "ALL" ? "primary" : "tertiary"}
            onClick={() => handleStatusFilterChange("ALL")}
            className="me-2"
          >
            ALL
          </Button>
          <Button
            color={statusFilter === "Accepted" ? "primary" : "tertiary"}
            onClick={() => handleStatusFilterChange("Accepted")}
            className="me-2"
          >
            Accepted
          </Button>
          <Button
            color={statusFilter === "Rejected" ? "primary" : "tertiary"}
            onClick={() => handleStatusFilterChange("Rejected")}
          >
            Rejected
          </Button>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Label className="m-0 me-2">Search:</Label>
          <Input
            onChange={(e) => setFilterText(e.target.value)}
            type="search"
            value={filterText}
            placeholder="Search By Name"
          />
        </div>
      </div>
    );
  }, [filterText, statusFilter]);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      <Breadcrumbs mainTitle={"Client Listing"} parent={"Provider"} />
      <Container fluid>
        <div className="d-flex justify-content-between items-center p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">Client Listing</h2>
          <button onClick={centeredToggle} className="btn btn-tertiary">
            Add New Client
          </button>
        </div>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <DataTable
                  columns={columns}
                  data={filteredItems}
                  pagination
                  subHeader
                  subHeaderComponent={subHeaderComponentMemo}
                  highlightOnHover
                  striped
                  persistTableHead
                  responsive
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <AddClientModal
        fetchPatients={refetch}
        centred={centred}
        centeredToggle={centeredToggle}
      />
      <Modal isOpen={openModal} toggle={() => setOpenModal(false)}>
        <ModalHeader toggle={() => setOpenModal(false)}>
          Remove Client
        </ModalHeader>
        <ModalBody>Are you sure you want to Remove this Client?</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => cancel()}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => deleteClient()}>
            Remove
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default page;
