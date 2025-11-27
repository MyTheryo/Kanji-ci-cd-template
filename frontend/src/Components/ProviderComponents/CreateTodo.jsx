"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../Loader";
import { useCreateTodoMutation } from "@/Redux/features/todos/todosApi";
import { useGetUserInfoByIdQuery } from "@/Redux/features/user/userApi";
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  Row,
  Col,
  Container,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormFeedback,
} from "reactstrap";
const CreateTodo = ({ patientId, setShowTodos }) => {
  const [createTodo, { data, isSuccess }] = useCreateTodoMutation();
  const {
    data: userInfo,
    isLoading,
    error,
  } = useGetUserInfoByIdQuery(patientId, { refetchOnMountOrArgChange: true });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [materials, setMaterials] = useState("");
  const [research, setResearch] = useState("");
  const [status, setStatus] = useState("in-progress");
  const [pcp, setPcp] = useState("not-set");
  const [email, setEmail] = useState("");
  const [emailSend, setEmailSend] = useState(false);
  const [hipaa, setHipaa] = useState(false);

  const [textareas, setTextareas] = useState([]);
  const [showPrescription, setShowPrescription] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showResearch, setShowResearch] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [showError, setShowError] = useState({
    description: false,
    pcp: false,
  });

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Handle input changes and reset errors for Description and PCP Release
  const handleDescriptionChange = (e) => {
    setNotes(e.target.value);
    if (e.target.value.trim() !== "") {
      setShowError((prevState) => ({ ...prevState, description: false }));
    }
  };

  const handlePcpChange = (e) => {
    setPcp(e.target.value);
    if (e.target.value !== "not-set") {
      setShowError((prevState) => ({ ...prevState, pcp: false }));
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Do something when todo creation is successful
      toast.success("Todo created successfully!");
      setShowTodos("patient-list");
    }
  }, [isSuccess, setShowTodos]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for Description and PCP Release

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

      return; // Prevent form submission if validation fails
    }
    setSubmitting(true);

    const data = {
      patientId: patientId,
      notes,
      prescription,
      materials,
      research,
      dueDate: selectedDate, // Due Date
      status, // Status
      emailSend, // Email Send
      name: userInfo?.user.firstName + " " + userInfo?.user.lastName, // Email
      hipaa, // hipaa
      pcp, // pcp
    };

    await createTodo(data);
    setSubmitting(false);
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

  //Return null if loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <Container className="">
      <Card className="">
        <CardHeader>
          <h2 className="text-secondary">
            Add a Todo for {userInfo?.user?.firstName}{" "}
            {userInfo?.user?.lastName}
          </h2>
        </CardHeader>
        <Form onSubmit={handleSubmit}>
          <CardBody>
            <Row className="mb-3">
              <Col md="8">
                <FormGroup>
                  <Label>
                    <Link href="" className="text-primary">
                      Client: {userInfo?.user?.firstName}{" "}
                      {userInfo?.user?.lastName}
                    </Link>
                  </Label>
                </FormGroup>
              </Col>
              <Col md="4" className="text-right d-md-flex justify-content-end">
                <Button color="primary" onClick={ShowPatientList}>
                  Todo List
                </Button>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md="4">
                <FormGroup>
                  <Label>Due Date</Label>
                  <Input
                    type="text"
                    value={format(new Date(selectedDate), "M/d/yyyy")}
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    readOnly
                  />
                  {showDatePicker && (
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      inline
                    />
                  )}
                </FormGroup>
              </Col>
            </Row>

            <FormGroup>
              <Label>
                Description <span className="text-danger">*</span>
              </Label>
              <Input
                type="textarea"
                value={notes}
                onChange={handleDescriptionChange}
                invalid={showError.description}
                placeholder="Enter description here"
              />
              {showError.description && (
                <FormFeedback>Description is required.</FormFeedback>
              )}
            </FormGroup>

            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={showPrescription}
                  onChange={() => handleCheckboxChange("prescription")}
                />
                Prescription
              </Label>
            </FormGroup>

            {showPrescription && (
              <FormGroup>
                <Label>Prescription</Label>
                <Input
                  type="textarea"
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={showMaterials}
                  onChange={() => handleCheckboxChange("materials")}
                />
                Send Materials
              </Label>
            </FormGroup>

            {showMaterials && (
              <FormGroup>
                <Label>Materials</Label>
                <Input
                  type="textarea"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={showResearch}
                  onChange={() => handleCheckboxChange("research")}
                />
                Research
              </Label>
            </FormGroup>

            {showResearch && (
              <FormGroup>
                <Label>Research</Label>
                <Input
                  type="textarea"
                  value={research}
                  onChange={(e) => setResearch(e.target.value)}
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Status</Label>
              <Input
                type="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </Input>
            </FormGroup>

            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={hipaa}
                  onChange={(e) => setHipaa(e.target.checked)}
                />
                Signed HIPAA in file
              </Label>
            </FormGroup>

            <FormGroup>
              <Label>
                PCP Release <span className="text-danger">*</span>
              </Label>
              <Input
                type="select"
                value={pcp}
                onChange={handlePcpChange}
                invalid={showError.pcp}
              >
                <option value="not-set">Not Set</option>
                <option value="patient-consented-to-release-information">
                  Client Consented to release Information
                </option>
                <option value="patient-declined-to-release-information">
                  Client Declined to release Information
                </option>
                <option value="not-applicable">Not Applicable</option>
              </Input>
              {showError.pcp && (
                <FormFeedback>
                  Please select a valid PCP release option.
                </FormFeedback>
              )}
            </FormGroup>
          </CardBody>
          <CardFooter>
            <Button disabled={submitting} color="primary" type="submit">
              {submitting ? (
                <i className="fa fa-spinner fa-spin"></i>
              ) : (
                "Save New Reminder"
              )}
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </Container>
  );
};

export default CreateTodo;
