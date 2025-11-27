"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../Loader";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
  Input,
  Form,
  FormGroup,
  Button,
} from "reactstrap";
import {
  useEditTodoMutation,
  useGetSingleTodoQuery,
} from "@/Redux/features/todos/todosApi";
import { useGetUserInfoByIdQuery } from "@/Redux/features/user/userApi";

const EditTodo = ({ patientId, setShowTodos, todoId, source }) => {
  const { data, isLoading: singleTodoLoading } = useGetSingleTodoQuery(todoId, {
    refetchOnMountOrArgChange: true,
  });
  const [editTodo, { isSuccess, isLoading: updatingTodo }] =
    useEditTodoMutation();
  const {
    data: userInfo,
    isLoading,
    error,
  } = useGetUserInfoByIdQuery(patientId, { refetchOnMountOrArgChange: true });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [prescription, setPrescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [research, setResearch] = useState("");
  const [showPrescription, setShowPrescription] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [status, setStatus] = useState("");
  const [emailSend, setEmailSend] = useState(false);
  const [pcp, setPcp] = useState("");
  const [hipaa, setHipaa] = useState(false);
  const [originalTodo, setOriginalTodo] = useState(null);
  const [showError, setShowError] = useState({
    description: false,
    pcp: false,
  });

  useEffect(() => {
    if (data && data.todo) {
      const todo = data.todo;

      setNotes(todo.notes || "");
      setSelectedDate(todo.dueDate ? new Date(todo.dueDate) : null);
      setPrescription(todo.prescription || "");
      setMaterials(todo.materials || "");
      setResearch(todo.research || "");
      setStatus(todo.status || "");
      setEmailSend(todo.emailSend || false);
      setPcp(todo.pcp || "");
      setHipaa(todo.hipaa || false);

      setOriginalTodo({
        notes: todo.notes || "",
        selectedDate: todo.dueDate ? new Date(todo.dueDate) : null,
        prescription: todo.prescription || "",
        materials: todo.materials || "",
        research: todo.research || "",
        status: todo.status || "",
        emailSend: todo.emailSend || false,
        pcp: todo.pcp || "",
        hipaa: todo.hipaa || false,
      });

      setShowPrescription(!!todo.prescription);
      setShowMaterials(!!todo.materials);
      setShowResearch(!!todo.research);
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Todo updated successfully!");
      setShowTodos(source);
    }
  }, [isSuccess]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (notes.trim() === "" || pcp === "not-set") {
      setShowError({
        description: notes.trim() === "",
        pcp: pcp === "not-set",
      });

      if (notes.trim() === "") {
        toast.error("Please enter a description.");
      }

      if (pcp === "not-set") {
        toast.error("Please select a PCP release option.");
      }

      return;
    }

    if (
      notes === originalTodo.notes &&
      selectedDate?.getTime() === originalTodo.selectedDate?.getTime() &&
      prescription === originalTodo.prescription &&
      materials === originalTodo.materials &&
      research === originalTodo.research &&
      status === originalTodo.status &&
      emailSend === originalTodo.emailSend &&
      pcp === originalTodo.pcp &&
      hipaa === originalTodo.hipaa
    ) {
      toast.error("No changes detected to update.");
      return;
    }

    const updatedData = {
      patientId,
      notes,
      prescription,
      materials,
      research,
      dueDate: selectedDate,
      status,
      emailSend,
      name: userInfo?.user.firstName + " " + userInfo?.user.lastName,
      hipaa,
      pcp,
    };

    editTodo({ todoId, data: updatedData });
    setNotes("");
  };

  const ShowPatientList = () => {
    setShowTodos("patient-list");
  };

  const handleCheckboxChange = (type) => {
    switch (type) {
      case "prescription":
        setShowPrescription(!showPrescription);
        break;
      case "materials":
        setShowMaterials(!showMaterials);
        break;
      case "research":
        setShowResearch(!showResearch);
        break;
      default:
        break;
    }
  };

  if (singleTodoLoading) {
    return <Loader />;
  }

  return (
    <Container className="">
      <Card className="">
        <CardHeader className="bg-primary">
          <Row>
            <Col>
              <h2 className="text-white">
                Edit Todo for {userInfo?.user?.firstName}{" "}
                {userInfo?.user?.lastName}
              </h2>
            </Col>
            <Col className="d-md-flex justify-content-end">
              <Button color="secondary" onClick={ShowPatientList}>
                Todo List
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md="6">
                <FormGroup>
                  <Label for="clientName">Client:</Label>
                  <p>
                    <Link href="" className="text-primary">
                      {userInfo?.user?.firstName} {userInfo?.user?.lastName}
                    </Link>
                  </p>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="dueDate">Due Date:</Label>
                  <div className="d-flex align-items-center">
                    <Input
                      type="text"
                      value={
                        selectedDate ? format(selectedDate, "MM/dd/yyyy") : ""
                      }
                      readOnly
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="mr-2"
                    />
                    {showDatePicker && (
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        inline
                      />
                    )}
                  </div>
                </FormGroup>
              </Col>
            </Row>

            <FormGroup className="mb-4">
              <Label for="notes">Description</Label>
              <Input
                type="textarea"
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                className={showError.description ? "is-invalid" : ""}
              />
              {showError.description && (
                <div className="invalid-feedback">Description is required.</div>
              )}
            </FormGroup>

            <FormGroup check className="mb-4">
              <Input
                type="checkbox"
                checked={showPrescription}
                onChange={() => handleCheckboxChange("prescription")}
              />
              <Label check>Prescription</Label>
            </FormGroup>
            {showPrescription && (
              <FormGroup className="mb-4">
                <Label for="prescription">Prescription</Label>
                <Input
                  type="textarea"
                  id="prescription"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  rows="2"
                />
              </FormGroup>
            )}

            <FormGroup check className="mb-4">
              <Input
                type="checkbox"
                checked={showMaterials}
                onChange={() => handleCheckboxChange("materials")}
              />
              <Label check>Send Materials</Label>
            </FormGroup>
            {showMaterials && (
              <FormGroup className="mb-4">
                <Label for="materials">Materials</Label>
                <Input
                  type="textarea"
                  id="materials"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  rows="2"
                />
              </FormGroup>
            )}

            <FormGroup check className="mb-4">
              <Input
                type="checkbox"
                checked={showResearch}
                onChange={() => handleCheckboxChange("research")}
              />
              <Label check>Research</Label>
            </FormGroup>
            {showResearch && (
              <FormGroup className="mb-4">
                <Label for="research">Research</Label>
                <Input
                  type="textarea"
                  id="research"
                  value={research}
                  onChange={(e) => setResearch(e.target.value)}
                  rows="2"
                />
              </FormGroup>
            )}

            <FormGroup className="mb-4">
              <Label for="status">Status</Label>
              <Input
                type="select"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </Input>
            </FormGroup>

            <FormGroup className="mb-4">
              <Label for="pcp">PCP Release</Label>
              <Input
                type="select"
                id="pcp"
                value={pcp}
                onChange={(e) => setPcp(e.target.value)}
                className={showError.pcp ? "is-invalid" : ""}
              >
                <option value="not-set">Not Set</option>
                <option value="patient-consented-to-release-information">
                  Client Consented to Release Information
                </option>
                <option value="patient-declined-to-release-information">
                  Client Declined to Release Information
                </option>
                <option value="not-applicable">Not Applicable</option>
              </Input>
              {showError.pcp && (
                <div className="invalid-feedback">
                  Please select a valid PCP release option.
                </div>
              )}
            </FormGroup>

            <FormGroup check className="mb-4">
              <Input
                type="checkbox"
                checked={hipaa}
                onChange={(e) => setHipaa(e.target.checked)}
              />
              <Label check>Signed HIPAA in file</Label>
            </FormGroup>

            <div className="d-flex justify-content-end">
              <Button color="primary" type="submit" disabled={updatingTodo}>
                {updatingTodo ? (
                  <i className="fa fa-spinner fa-spin px-5"></i>
                ) : (
                  "Save New Reminder"
                )}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditTodo;
