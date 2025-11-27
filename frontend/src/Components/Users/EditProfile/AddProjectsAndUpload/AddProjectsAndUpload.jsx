"use client";
import { Col, Label, Input } from "reactstrap";
import { AddprojectAndUpload } from "../../../../Constant";
import CommonCardHeader from "../../../../CommonComponent/CommonCardHeader/CommonCardHeader";
import { useState, useMemo } from "react";
import DataTable from "react-data-table-component";

const AddProjectsAndUpload = () => {
  const columnsProvider = [
    {
      name: "#",
      selector: (row) => row.id,
      width: "70px",
    },
    {
      name: "Provider Name",
      selector: (row) => row.name,
      sortable: true,
      compact: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`badge ${
            row.status == "Accepted" ? "badge-success" : "badge-danger"
          }`}
        >
          {row.status}
        </span>
      ),
      compact: true,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button className="btn btn-danger btn-sm">{row.action}</button>
      ),
      width: "150px",
    },
  ];
  const dataProvider = [
    {
      id: 1,
      name: "Beetlejuice",
      status: "Accepted",
      action: "Disconnect",
    },
    {
      id: 2,
      name: "Awais",
      status: "Accepted",
      action: "Disconnect",
    },
    {
      id: 3,
      name: "Hammad",
      status: "Rejected",
      action: "Disconnect",
    },
  ];

  const [filterText, setFilterText] = useState("");

  const filteredItems = dataProvider.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
  );
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

  return (
    <Col md="12">
      <CommonCardHeader
        title={AddprojectAndUpload}
        tagClass="card-title mb-0"
      />
      <DataTable
        columns={columnsProvider}
        data={filteredItems}
        pagination
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        highlightOnHover
        striped
        persistTableHead
        responsive
      />
    </Col>
  );
};

export default AddProjectsAndUpload;
