"use client";
import React, { useState, useMemo, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  useFetchAllUsersQuery,
  useToggleUserApprovalMutation,
  useDeleteUserMutation,
} from "@/Redux/features/admin/adminApi";
import { toast } from "react-toastify";
import Loading from "../loading";
import "./AllUserStyle.css";
import { CSVLink } from "react-csv";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap"; // Assuming you are using Reactstrap for the Button component
import Loader from "@/Components/Loader";
import { decodeBase64 } from "@/utils/helpers";

const AllUsers = () => {
  const {
    data: allUsers,
    isLoading,
    error,
    refetch,
  } = useFetchAllUsersQuery({
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    skip: false,
    keepUnusedDataFor: 0,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const [toggleUserApproval] = useToggleUserApprovalMutation();
  const [deleteUser] = useDeleteUserMutation(); // Assume you have a mutation for deleting a user

  const [searchTerm, setSearchTerm] = useState("");
  const [checkboxState, setCheckboxState] = useState({});

  const [openModal, setOpenModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [approving, setApproving] = useState(false);
  // Close confirmation modal
  const closeConfirmationModal = () => {
    setOpenModal(false);
    setSelectedUserId(null);
  };

  const handleCheckboxChange = async (userId) => {
    try {
      setApproving(true);
      // Toggle the checkbox state locally
      setCheckboxState((prevState) => ({
        ...prevState,
        [userId]: !prevState[userId],
      }));

      // Trigger the mutation to toggle the approval status in the backend
      const response = await toggleUserApproval(userId).unwrap();
      if (response.success) {
        setApproving(false);
        toast.success(response.message || "Approval Status Changed");
      } else {
        setApproving(false);
        toast.error(response.message || "Something Went Wrong...");
      }
      refetch();
    } catch (error) {
      setApproving(false);
      toast.error("Something Went Wrong...");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId).unwrap();
      if (response.success) {
        toast.success(response.message || "User Deleted Successfully");
        refetch(); // Refetch data after deletion
      } else {
        toast.error(response.message || "Failed to Delete User");
      }
    } catch (error) {
      console.log("Error deleting user:", error);
      toast.error(error);
    }
  };

  // Filtering users based on the search term
  const filteredUsers = useMemo(() => {
    if (!allUsers?.data) return [];
    return allUsers.data
      .filter((user) =>
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by createdAt in descending order
  }, [allUsers, searchTerm]);

  // Map the data to match the structure of your columns
  const csvData = filteredUsers.map((row) => ({
    "First Name": row.firstName,
    "Last Name": row.lastName,
    Email: row.email,
    "Unique ID": decodeBase64(row?.customerId) || "N/A",
    "User Role": row.userRole == "Patient" ? "Client" : row.userRole,
    "License Number": row.npiNumber ? row.npiNumber : "N/A",
    "Last Login Date": row.lastLogin
      ? new Date(row.lastLogin).toLocaleDateString() +
        " | " +
        new Date(row.lastLogin).toLocaleTimeString()
      : "N/A",
    Region: row.country ? row.region + "," + row.country : "N/A",
    "Created At": new Date(row.createdAt).toLocaleDateString(),
    "Approval Status": row.approvedByAdmin ? "Approved" : "Not Approved",
  }));

  if (isLoading) return <Loading />;
  if (error) return null;

  const columns = [
    {
      name: "First Name",
      selector: (row) => row.firstName,
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Last Name",
      selector: (row) => row.lastName,
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      wrap: true,
      grow: 2,
      minWidth: "280px",
    },
    {
      name: "Unique ID",
      selector: (row) => decodeBase64(row.customerId) || "N/A",
      compact: true,
    },
    {
      name: "User Role",
      selector: (row) => (row.userRole === "Provider" ? "Provider" : "Client"),
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "License Number",
      selector: (row) => (row.npiNumber ? row.npiNumber : "N/A"),
      sortable: false,
      compact: true,
      minWidth: "130px",
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
      sortFunction: (rowA, rowB) =>
        new Date(rowA.createdAt) - new Date(rowB.createdAt), // Custom sort function for dates
      minWidth: "120px",
    },
    {
      name: "Region",
      selector: (row) => (row.country ? row.region + "," + row.country : "N/A"),
      sortable: false,
      compact: true,
      wrap: true,
    },
    {
      name: "Last Login Date",
      selector: (row) => {
        if (!row.lastLogin) {
          return "N/A";
        }

        const lastLoginDate = new Date(row.lastLogin).toLocaleDateString();
        const statusCircle =
          row.isActive === false ? (
            <i
              className="fa fa-circle"
              style={{ color: "red", marginLeft: "10px" }}
            ></i>
          ) : (
            <i
              className="fa fa-circle"
              style={{ color: "green", marginLeft: "10px" }}
            ></i>
          );

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>{lastLoginDate}</span>
            {statusCircle}
          </div>
        );
      },
      sortable: true,
      sortFunction: (rowA, rowB) => {
        const dateA = rowA.lastLogin ? new Date(rowA.lastLogin) : new Date(0);
        const dateB = rowB.lastLogin ? new Date(rowB.lastLogin) : new Date(0);
        return dateA - dateB; // Compare the dates
      },
      minWidth: "150px",
    },
    {
      name: "Approval Status",
      cell: (row) =>
        row?.approvedByAdmin ? (
          <span className="bg-success text-white p-2 py-1 rounded-2">
            Approved
          </span>
        ) : (
          <span className="bg-danger text-white p-2 py-1 rounded-2">
            Not Approved
          </span>
        ),
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          {/* Checkbox for approval toggle */}
          <input
            style={{ width: "22px", height: "22px" }}
            type="checkbox"
            checked={row?.approvedByAdmin ? true : false}
            onChange={() => handleCheckboxChange(row._id)}
          />

          {/* Delete button */}
          <Button
            size="xs"
            color="danger"
            onClick={() => {
              setSelectedUserId(row._id);
              setOpenModal(true);
            }} // Handle user deletion
            className="ms-2"
          >
            <h5 className="text-white">
              <i className="fa fa-trash"></i>
            </h5>
          </Button>
        </div>
      ),
      minWidth: "120px",
    },
  ];

  return (
    <div className="custam-bg">
      <div
        className="mb-1 px-2 px-md-4 bg-primary text-white d-flex justify-content-between align-items-center w-100"
        style={{ height: "90px" }}
      >
        <h3 className="fw-bold capitalize text-white">
          Users Site Authorization
        </h3>
      </div>
      <div className="p-4">
        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          responsive
          striped
          noHeader
          subHeader
          subHeaderComponent={
            <div className="d-flex w-100 gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-100 p-2 my-2 border rounded"
              />
              <CSVLink
                data={csvData}
                filename="TheryoUserList.csv"
                className="btn btn-primary ms-2 my-2"
                style={{ minWidth: "130px" }}
              >
                Export CSV
              </CSVLink>
            </div>
          }
        />
      </div>
      <Modal isOpen={openModal} toggle={closeConfirmationModal}>
        <ModalHeader toggle={closeConfirmationModal}>
          Delete Confirmation
        </ModalHeader>
        <ModalBody>Are you sure you want to Delete this User?</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={closeConfirmationModal}>
            Cancel
          </Button>
          <Button
            color="danger"
            onClick={() => {
              handleDeleteUser(selectedUserId);
              closeConfirmationModal();
            }}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      {approving && (
        <div
          className="position-fixed top-50 start-50 d-flex align-items-center bg-primary p-3 rounded gap-3 px-4"
          style={{ zIndex: 1050, transform: "translate(-50%, -50%)" }}
        >
          <i className="fa fa-spinner fa-spin fs-4"></i>
          <h5 className="text-white text-center">Updating...</h5>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
