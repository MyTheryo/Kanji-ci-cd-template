"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
// import {
//   useEditTodoMutation,
//   useGetSingleTodoQuery,
// } from "@/redux/features/todos/todosApi";
import { toast } from "react-toastify";
// import { useGetUserInfoByIdQuery } from "@/redux/features/user/userApi";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGetUserInfoByIdQuery } from "@/Redux/features/user/userApi";
import {
  useEditTodoMutation,
  useGetSingleTodoQuery,
} from "@/Redux/features/todos/todosApi";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Label,
  Row,
} from "reactstrap";
// import Loader from "../Loader";

const TodoDetail = ({ patientId, setShowTodos, todoId }) => {
  const { data, isLoading: todoLoading } = useGetSingleTodoQuery(todoId, {
    refetchOnMountOrArgChange: true,
  });
  const [editTodo, { isSuccess }] = useEditTodoMutation();
  const {
    data: userInfo,
    isLoading,
    error,
  } = useGetUserInfoByIdQuery(patientId);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date(data?.todo?.dueDate || "")
  );
  const [notes, setNotes] = useState(data?.todo?.notes);
  const [status, setStatus] = useState(data?.todo?.status);
  const [emailSend, setEmailSend] = useState(data?.todo?.emailSend);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("Todo updated successfully!");
      setShowTodos("patient-list");
    }
  }, [isSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      notes,
      dueDate: selectedDate, // Due Date
      status, // Status
      emailSend, // Email Send
    };

    if (notes === "") {
      return toast.error("Please Enter Notes");
    }
    editTodo({ todoId, data });
    setNotes("");
  };

  const ShowPatientList = () => {
    setShowTodos("patient-list");
  };

  //Return null if loading
  // if (isLoading || todoLoading) {
  //   return <Loader />;
  // }
  return (
    <Container className="">
      <Card className="">
        {/* Detail Header */}
        <CardHeader className="bg-primary">
          <h2 className="font-weight-bold text-white">Todo Details</h2>
        </CardHeader>

        {/* Todo Information */}
        <CardBody>
          <Row>
            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">Client:</Label>
              <p className="text-dark">
                {userInfo?.user?.firstName} {userInfo?.user?.lastName}
              </p>
            </Col>

            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">Due Date:</Label>
              <p className="text-dark">
                {data && format(new Date(data?.todo?.dueDate), "MM-dd-yyyy")}
              </p>
            </Col>

            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">Description:</Label>
              <p className="text-dark">{data?.todo?.notes}</p>
            </Col>

            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">Prescription:</Label>
              <p className="text-dark">{data?.todo?.prescription}</p>
            </Col>

            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">Materials:</Label>
              <p className="text-dark">{data?.todo?.materials}</p>
            </Col>

            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">Research:</Label>
              <p className="text-dark">{data?.todo?.research}</p>
            </Col>

            <Col md="12" className="mb-4">
              <Label className="text-dark f-w-700">Status:</Label>
              <p className="text-dark">
                {data?.todo?.status?.toLowerCase() === "done" ? (
                  <h5 className="badge-heading pb-0">
                    <span className="text-capitalize badge bg-success">
                      {data?.todo?.status}
                    </span>
                  </h5>
                ) : (
                  <h5 className="badge-heading pb-0">
                    <span className="text-capitalize badge bg-info">
                      {data?.todo?.status}
                    </span>
                  </h5>
                )}
              </p>
            </Col>

            <Col md="6" className="mb-4">
              <Label className="text-dark f-w-700">PCP Release:</Label>
              <p className="text-dark">{data?.todo?.pcp}</p>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Container>
  );
};

export default TodoDetail;
