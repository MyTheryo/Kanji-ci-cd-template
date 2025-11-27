import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import DataTable from "react-data-table-component";
import {
  useDeleteTodoMutation,
  useGetTodoNotesQuery,
} from "@/Redux/features/todos/todosApi";
import Loader from "../Loader";
import { Width } from "@/Constant";

const PatientList = ({ setShowTodos, patientId, setTodoId }) => {
  const [openModal, setOpenModal] = useState(false);
  const [archiveValue, setArchiveValue] = useState("1");
  const { data, isLoading, refetch } = useGetTodoNotesQuery(
    { patientId, archiveValue },
    { refetchOnMountOrArgChange: true }
  );
  const [
    deleteTodo,
    { isSuccess, isLoading: deleteLoading, data: deleteData },
  ] = useDeleteTodoMutation();
  const [selectedTodo, setSelectedTodo] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [isDelete, setIsDelete] = useState(false);

  // Open confirmation modal
  const openConfirmationModal = (todoId) => {
    setSelectedTodo(todoId);
    setOpenModal(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setOpenModal(false);
    setSelectedTodo(null);
    setIsDelete(false);
  };

  const handleDeleteTodo = async (todoId, archiveStatus) => {
    await deleteTodo({ todoId, data: { action: archiveStatus } });
    closeConfirmationModal();
  };

  const handleEditTodo = (id) => {
    setTodoId(id);
    setShowTodos("edit-todo");
  };

  const handleTodoDetail = (id) => {
    setTodoId(id);
    setShowTodos("todo-detail");
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(deleteData?.message);
      refetch();
    }
  }, [isSuccess, refetch]);

  // Refetch todos whenever archiveValue changes
  useEffect(() => {
    refetch();
  }, [archiveValue, refetch]);

  useEffect(() => {
    if (data) {
      const filtered = data?.todos?.filter((todo) => {
        const searchTermLower = searchTerm?.toLowerCase();
        return (
          todo?.notes?.toLowerCase()?.includes(searchTermLower) ||
          todo?.status?.toLowerCase()?.includes(searchTermLower) ||
          todo?.prescription?.toLowerCase()?.includes(searchTermLower) ||
          todo?.research?.toLowerCase()?.includes(searchTermLower) ||
          todo?.materials?.toLowerCase()?.includes(searchTermLower) ||
          (todo?.dueDate &&
            new Date(todo?.dueDate)
              ?.toLocaleDateString()
              ?.includes(searchTermLower))
        );
      });

      // Sort by dueDate in descending order (latest first)
      const sortedTodos = filtered.sort((a, b) => {
        return new Date(b?.dueDate) - new Date(a?.dueDate);
      });

      setFilteredRows(sortedTodos);
    }
  }, [data, searchTerm]);

  // Handle search term change
  const handleSearchTermChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const columns = [
    {
      name: "Due Date",
      cell: (row) =>
        row?.dueDate ? format(new Date(row?.dueDate), "MM-dd-yyyy") : "N / A",
      sortable: true,
    },
    {
      name: "Description",
      cell: (row) => row?.notes || "N/A",
      sortable: true,
    },
    {
      name: "Prescription",
      selector: (row) => row?.prescription || "N/A",
    },
    {
      name: "Research",
      selector: (row) => row?.research || "N/A",
    },
    {
      name: "Send Material",
      selector: (row) => row?.materials || "N/A",
    },
    {
      name: "Status",
      selector: (row) =>
        row?.status?.toLowerCase() === "done" ? (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-success">
              {row?.status}
            </span>
          </h5>
        ) : (
          <h5 className="badge-heading pb-0">
            <span className="text-capitalize badge bg-info">{row?.status}</span>
          </h5>
        ),
      compact: true,
      width: "90px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            size="xs"
            color="primary"
            onClick={() => handleTodoDetail(row?._id)}
          >
            <h5 className="text-white">
              <i className="fa fa-eye"></i>
            </h5>
          </Button>
          <Button
            size="xs"
            color="secondary"
            onClick={() => handleEditTodo(row?._id)}
          >
            <h5 className="text-white">
              <i className="fa fa-edit"></i>
            </h5>
          </Button>
          <Button
            size="xs"
            color="danger"
            onClick={() => {
              setIsDelete(true);
              openConfirmationModal(row?._id);
            }}
          >
            <h5 className="text-white">
              <i className="fa fa-trash"></i>
            </h5>
          </Button>
          <Button
            size="xs"
            color={archiveValue === "1" ? "danger" : "success"}
            onClick={() => openConfirmationModal(row?._id)}
          >
            <h5 className="text-white">
              {archiveValue === "1" ? (
                <i className="fa fa-archive"></i>
              ) : (
                <i className="fa fa-check"></i>
              )}
            </h5>
          </Button>
        </div>
      ),
      width: "165px",
    },
  ];

  // Return null if loading
  if (isLoading || deleteLoading) {
    return <Loader />;
  }

  return (
    <>
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div
                id="basic-1_filter"
                className="dataTables_filter client-dt-filter d-flex align-items-center justify-content-between w-100 mb-4"
              >
                {/* Class Design Within theme-customizer */}
                <div className="pro-todo-filters">
                  <div
                    id="basic-1_filter"
                    className="dataTables_filter d-flex align-items-center"
                  >
                    <Input
                      onChange={handleSearchTermChange}
                      type="text"
                      value={searchTerm}
                      placeholder="Search"
                      className="bg-primary text-white white-placeholder rounded"
                    />
                  </div>
                  <div className="d-flex">
                    <Button
                      color={archiveValue === "1" ? "success" : "info"}
                      onClick={() => setArchiveValue("1")}
                      className="me-2"
                    >
                      Active
                    </Button>
                    <Button
                      color={archiveValue === "0" ? "success" : "info"}
                      onClick={() => setArchiveValue("0")}
                      className="me-2"
                    >
                      Archived
                    </Button>
                    <Button
                      color="info"
                      onClick={() => setShowTodos("todo")}
                      className="me-2"
                    >
                      <i className="fa fa-plus"></i> New Todo
                    </Button>
                  </div>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={filteredRows}
                pagination
                onChangePage={handlePageChange}
                highlightOnHover
                striped
                persistTableHead
                responsive
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Modal isOpen={openModal} toggle={closeConfirmationModal}>
        <ModalHeader toggle={closeConfirmationModal}>
          {isDelete
            ? "Delete Confirmation"
            : archiveValue === "1"
            ? "Archive Confirmation"
            : "Restore Confirmation"}
        </ModalHeader>
        <ModalBody>
          {isDelete
            ? "Are you sure you want to Delete this note?"
            : archiveValue === "1"
            ? "Are you sure you want to archive this todo note?"
            : "Are you sure you want to Restore this note?"}
        </ModalBody>
        <ModalFooter>
          <Button
            color={
              isDelete ? "primary" : archiveValue === "1" ? "primary" : "danger"
            }
            onClick={closeConfirmationModal}
          >
            Cancel
          </Button>
          <Button
            color={
              isDelete ? "danger" : archiveValue === "1" ? "danger" : "success"
            }
            onClick={() =>
              handleDeleteTodo(selectedTodo, isDelete ? "delete" : "archive")
            }
          >
            {isDelete
              ? "Confirm Delete"
              : archiveValue === "1"
              ? "Confirm Archive"
              : "Confirm Restore"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default PatientList;
