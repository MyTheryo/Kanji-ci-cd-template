"use client";
import React, { useEffect } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Card, CardBody, Col, Row, Container, Button } from "reactstrap";
import { useState } from "react";
import DataTable from "react-data-table-component";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSession } from "next-auth/react";
import { useGetAllTodoDataQuery } from "@/Redux/features/todos/todosApi";
import { format } from "date-fns";
import TodoDetail from "@/Components/ProviderComponents/TodoDetail";
import EditTodo from "@/Components/ProviderComponents/EditTodo";
import Loader from "@/Components/Loader";

const page = () => {
  const { data: session } = useSession();
  const providerId = session?.user._id;
  const [todos, setTodos] = useState([]);
  const [todoId, setTodoId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [showTodos, setShowTodos] = useState("todo-list");
  const [statusFilter, setStatusFilter] = useState("Today");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: todosData,
    error: todosError,
    isLoading,
    refetch,
  } = useGetAllTodoDataQuery(
    { providerId },
    {
      refetchOnFocus: true,
    }
  );
  const [filteredTodos, setFilteredTodos] = useState([]);

  const handlePageChange = (page) => {
    setCurrentPage(page); // Update the current page when the user changes it
  };

  const handleRowsPerPageChange = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage); // Update the rows per page
    setCurrentPage(page); // Update current page
  };

  const handleEditTodo = (id, todoId) => {
    setTodoId(todoId);
    setPatientId(id);
    setShowTodos("edit-todo");

    refetch();
  };

  const handleTodoDetail = (id, todoId) => {
    setTodoId(todoId);
    setPatientId(id);
    setShowTodos("todo-detail");
  };

  useEffect(() => {
    if (!isLoading && todosData) {
      setTodos(todosData.todos || []);
    }
  }, [todosData, isLoading]);

  useEffect(() => {
    refetch();
  }, [showTodos]);

  useEffect(() => {
    console.log(todosData); // Log the data to ensure it is fetching correctly
  }, [todosData]);

  const getTodayTodos = () => {
    const today = new Date();
    return todos?.filter((todo) => {
      const todoDate = new Date(todo?.dueDate);
      return (
        todoDate.getFullYear() === today.getFullYear() &&
        todoDate.getMonth() === today.getMonth() &&
        todoDate.getDate() === today.getDate() &&
        todo?.patientId?.firstName?.toLowerCase()
      );
    });
  };

  const getAllTodos = () => {
    return todos
      ?.filter((todo) => {
        const todoDate = new Date(todo?.dueDate);
        return todo?.patientId?.firstName?.toLowerCase();
      })
      .sort((a, b) => {
        const dateA = new Date(a?.dueDate);
        const dateB = new Date(b?.dueDate);
        return dateB - dateA;
      });
  };

  useEffect(() => {
    if (statusFilter?.toLowerCase() === "today") {
      const todayTodos = getTodayTodos();
      setFilteredTodos(todayTodos);
    } else {
      const allTodos = getAllTodos();
      setFilteredTodos(allTodos);
    }
  }, [todos, statusFilter]);

  const columns = [
    {
      name: "Index",
      cell: (row, index) => (currentPage - 1) * rowsPerPage + (index + 1),
      width: "70px",
    },
    {
      name: "Due Date",
      cell: (row) =>
        row?.dueDate ? format(new Date(row?.dueDate), "MM-dd-yyyy") : "N / A",
      sortable: true,
    },
    {
      name: "Client Name",
      cell: (row) => row?.patientId?.firstName || "N/A",
      sortable: true,
    },
    {
      name: "Prescription",
      selector: (row) => row?.prescription || "N/A",
      omit: !(
        statusFilter?.toLowerCase() === "prescription" ||
        statusFilter?.toLowerCase() === "today"
      ),
    },
    {
      name: "Research",
      selector: (row) => row?.research || "N/A",
      omit: !(
        statusFilter?.toLowerCase() === "research" ||
        statusFilter?.toLowerCase() === "today"
      ),
    },
    {
      name: "Send Material",
      selector: (row) => row?.materials || "N/A",
      omit: !(
        statusFilter?.toLowerCase() === "material" ||
        statusFilter?.toLowerCase() === "today"
      ),
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
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            size="xs"
            color="primary"
            onClick={() => handleTodoDetail(row?.patientId?._id, row?._id)}
          >
            <h5 className="text-white">
              <i className="fa fa-eye"></i>
            </h5>
          </Button>
          <Button
            size="xs"
            onClick={() => handleEditTodo(row?.patientId._id, row?._id)}
          >
            <h5 className="text-white">
              <i className="fa fa-edit"></i>
            </h5>
          </Button>
        </div>
      ),
    },
  ];

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowTodos("todo-list");
  };

  // Formik and Yup for form handling and validation
  const formik = useFormik({
    initialValues: {
      clientName: "",
      clientEmail: "",
    },
    validationSchema: Yup.object({
      clientName: Yup.string().required("Client Name is required"),
      clientEmail: Yup.string()
        .email("Invalid email address")
        .required("Client Email is required"),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      // Add your form submission logic here
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"Open Notes"} parent={"Provider"} />
      <Container fluid>
        <div className="d-flex justify-content-between items-center p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">Open Notes</h2>
        </div>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <div
                  id="basic-1_filter"
                  className="dataTables_filter client-dt-filter d-flex align-items-center justify-content-between w-100 mb-4"
                >
                  <div className="d-flex overflow-x-auto w-100">
                    <Button
                      color={statusFilter === "Today" ? "primary" : "tertiary"}
                      onClick={() => handleStatusFilterChange("Today")}
                      className="me-2"
                    >
                      Today Todo's
                    </Button>
                    <Button
                      color={
                        statusFilter === "Research" ? "primary" : "tertiary"
                      }
                      onClick={() => handleStatusFilterChange("Research")}
                      className="me-2"
                    >
                      Research
                    </Button>
                    <Button
                      color={
                        statusFilter === "Prescription" ? "primary" : "tertiary"
                      }
                      onClick={() => handleStatusFilterChange("Prescription")}
                      className="me-2"
                    >
                      Prescription
                    </Button>
                    <Button
                      color={
                        statusFilter === "Material" ? "primary" : "tertiary"
                      }
                      onClick={() => handleStatusFilterChange("Material")}
                    >
                      Send Material
                    </Button>
                  </div>
                </div>
                {showTodos === "todo-list" && (
                  <DataTable
                    columns={columns}
                    data={filteredTodos}
                    pagination
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handleRowsPerPageChange}
                    highlightOnHover
                    striped
                    persistTableHead
                    responsive
                  />
                )}
                {showTodos === "todo-detail" && (
                  <TodoDetail
                    todoId={todoId}
                    setShowTodos={setShowTodos}
                    patientId={patientId}
                  />
                )}
                {showTodos === "edit-todo" && (
                  <EditTodo
                    todoId={todoId}
                    setShowTodos={setShowTodos}
                    patientId={patientId}
                    source="todo-list"
                  />
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default page;
