"use client";
import React, { useEffect, useMemo } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Card, CardBody, Col, Row, Container, Input, Label } from "reactstrap";
import { useState } from "react";
import DataTable from "react-data-table-component";
import { useSession } from "next-auth/react";
import { useGetAllPatientsQuery } from "@/Redux/features/provider/providerApi";
import Loader from "@/Components/Loader";
import Link from "next/link";
import AddClientModal from "@/Components/ProviderComponents/AddClientModal";
import { decodeBase64 } from "@/utils/helpers";

const page = () => {
  const { data: session } = useSession();
  const [centred, setCentered] = useState(false);
  const [tableData, setTableData] = useState([]);
  const centeredToggle = () => setCentered(!centred);
  const { data, isLoading, refetch } = useGetAllPatientsQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const columns = [
    {
      name: "Client Name",
      cell: (row) =>
        row?.status?.toLowerCase() !== "deleted" &&
        (row?.status?.toLowerCase() === "rejected" && row?.id ? (
          <span
            className="text-gray-400"
            style={{ cursor: "not-allowed" }}
            onClick={() =>
              toast.error(
                "This user is Rejected. Please accept the user first."
              )
            }
          >
            {row?.name}
          </span>
        ) : row?.status?.toLowerCase() === "pending" ? (
          <span className="text-muted" style={{ cursor: "not-allowed" }}>
            {row?.name}
          </span>
        ) : row?.getInvited === "sendInvitation" && !row?.id ? (
          <span className="text-gray-400" style={{ cursor: "not-allowed" }}>
            {row?.name}
          </span>
        ) : (
          row?.id && (
            <Link
              className="f-w-600"
              href={`/provider/patient-overview/${row?.id}`}
            >
              {row?.name}
            </Link>
          )
        )),
      sortable: true,
    },
    {
      name: "Client ID",
      selector: (row) => decodeBase64(row?.customerId) || "N/A",
      sortable: true,
      width: "90px",
      compact: true,
    },
    {
      name: "Client Email",
      selector: (row) => row.email,
      sortable: true,
      grow: 2,
      minWidth: "200px",
    },
    {
      name: "Phone",
      selector: (row) => row.phone,
    },
    {
      name: "Status",
      selector: (row) =>
        row?.status?.toLowerCase() === "accepted" ? (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-success">
              {row?.status}
            </span>
          </h5>
        ) : row?.status?.toLowerCase() === "rejected" ? (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-danger">
              {row?.status}
            </span>
          </h5>
        ) : (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-warning">
              {row?.status}
            </span>
          </h5>
        ),
      compact: true,
      width: "120px",
    },
  ];

  useEffect(() => {
    if (data) {
      const transformedData = data?.patients?.map((item, index) => ({
        id: item?.senderId || index + 1, // Map senderId to id or use index as fallback
        customerId: item?.patientId || item?.doctorId || "N/A", // Map customerId
        name: item?.firstName || "N/A", // Map firstName to name
        email: item?.email || "N/A", // Map email
        getInvited: item?.getInvited || "N/A", // Map email
        phone: item?.phoneNumber || "N/A", // Map phoneNumber to phone
        status: item?.invitationStatus || "Pending", // Map invitationStatus to status
      }));
      setTableData(
        transformedData?.filter((item) => item?.invitationStatus !== "deleted")
      );
      refetch();
    }
  }, [data]);

  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    return tableData?.filter((item) => {
      const nameMatch = item?.name
        ?.toLowerCase()
        .includes(filterText.toLowerCase());
      const emailMatch = item?.email
        ?.toLowerCase()
        .includes(filterText.toLowerCase());
      const statusMatch = item?.status
        ?.toLowerCase()
        .includes(filterText.toLowerCase());

      // Return true if any of the fields match the filter text
      return nameMatch || emailMatch || statusMatch;
    });
  }, [filterText, tableData]);

  const subHeaderComponentMemo = useMemo(() => {
    return (
      <div
        id="basic-1_filter"
        className="dataTables_filter d-flex align-items-center"
      >
        <Label className="m-0 me-2">Search:</Label>
        <Input
          onChange={(e) => setFilterText(e.target.value)}
          type="search"
          value={filterText}
          placeholder="Search By Name"
        />
      </div>
    );
  }, [filterText]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"Home"} parent={"Provider"} />
      <Container fluid>
        <div className="d-flex justify-content-between items-center p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">Hello {session?.user?.firstName},</h2>
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
    </div>
  );
};

export default page;
