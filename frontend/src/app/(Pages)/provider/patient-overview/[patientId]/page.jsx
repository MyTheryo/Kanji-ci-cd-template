"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TabData } from "@/Data/OtherPage/OtherPage";
import Breadcrumbs from "@/CommonComponent/Breadcrumbs/Breadcrumbs";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import PatientInfo from "@/Components/ProviderComponents/PatientInfo";
import { useGetUserInfoByIdQuery } from "@/Redux/features/user/userApi";
import Loader from "@/Components/Loader";
import EditPatientInfo from "@/Components/ProviderComponents/EditPatientInfo";
import SharedSummaries from "@/Components/ProviderComponents/SharedSummaries";
import PatientList from "@/Components/ProviderComponents/PatientList";
import CreateTodo from "@/Components/ProviderComponents/CreateTodo";
import EditTodo from "@/Components/ProviderComponents/EditTodo";
import TodoDetail from "@/Components/ProviderComponents/TodoDetail";
import PatientDocuments from "@/Components/ProviderComponents/PatientDocuments";
import CreateNote from "@/Components/ProviderComponents/CreateNote";
import ViewCareplan from "@/Components/ProviderComponents/ViewCareplan";
import EditNote from "@/Components/ProviderComponents/EditNotes";
import WeeklyPatientReport from "@/Components/ProviderComponents/ProviderPatientReport";
import { useRouter } from "next/navigation";

const PatientOverview = () => {
  const pathName = usePathname();
  const id = pathName.split("/")[3];
  const { data, isLoading, error } = useGetUserInfoByIdQuery(id);
  const [activeTab, setActiveTab] = useState(0); // Initialize with default tab
  const [isEditing, setIsEditing] = useState(false);
  const [noteId, setNoteId] = useState("");
  const [careplanId, setCareplanId] = useState("");
  const [todoId, setTodoId] = useState("");
  const [showPatientDocuments, setShowPatientDocuments] = useState("document");
  const [patientData, setPatientData] = useState(null);
  const [showTodos, setShowTodos] = useState("patient-list");
  const [editClick, setEditClick] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (data) {
      setPatientData(data?.user);
    }
    if (!data?.user && !isLoading) {
      router.push("/error");
    }
    if (error) {
      console.error("API Error: ", error);
    }
  }, [data, error]); // Add 'error' to the dependency array

  const toggleTab = (i) => {
    setActiveTab(i);
    setShowPatientDocuments("document");
    setShowTodos("patient-list");
  };

  const handleEditClick = (patientData) => {
    setIsEditing(true);
  };
  const updatePatientData = (updatedData) => {
    setPatientData(updatedData);
  };

  //Display Loader if loading
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"Patient Overview"} parent={"Provider"} />
      <Container fluid>
        <div className="d-flex justify-content-between items-center p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">Client Name: {data?.user?.firstName}</h2>
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
                    {TabData.map((todo, i) => (
                      <Button
                        key={i}
                        color={activeTab === i ? "primary" : "tertiary"}
                        onClick={() => toggleTab(i)}
                        className="me-2"
                        style={{ minWidth: "130px" }}
                      >
                        {todo}
                      </Button>
                    ))}
                  </div>
                </div>
                {activeTab === 0 && (
                  <>
                    {isEditing ? (
                      <EditPatientInfo
                        patientData={patientData}
                        setIsEditing={setIsEditing}
                        onUpdate={updatePatientData}
                        onCancel={() => setIsEditing(false)}
                      />
                    ) : (
                      <PatientInfo
                        patientData={patientData}
                        onEditClick={handleEditClick}
                      />
                    )}
                  </>
                )}
                {activeTab === 1 && showTodos === "patient-list" && (
                  <PatientList
                    setTodoId={setTodoId}
                    setShowTodos={setShowTodos}
                    patientId={id}
                  />
                )}
                {activeTab === 1 && showTodos === "todo" && (
                  <CreateTodo setShowTodos={setShowTodos} patientId={id} />
                )}
                {activeTab === 1 && showTodos === "edit-todo" && (
                  <EditTodo
                    todoId={todoId}
                    setShowTodos={setShowTodos}
                    patientId={id}
                    source="patient-list"
                  />
                )}
                {activeTab === 1 && showTodos === "todo-detail" && (
                  <TodoDetail
                    todoId={todoId}
                    setShowTodos={setShowTodos}
                    patientId={id}
                  />
                )}
                {activeTab === 2 && showPatientDocuments === "document" && (
                  <PatientDocuments
                    setShowPatientDocuments={setShowPatientDocuments}
                    patientId={id}
                    setNoteId={setNoteId}
                    setCareplanId={setCareplanId}
                  />
                )}
                {activeTab === 2 && showPatientDocuments === "create-note" && (
                  <CreateNote
                    patientId={id}
                    patientName={data?.user.firstName}
                    setShowPatientDocuments={setShowPatientDocuments}
                    setEditClick={setEditClick}
                  />
                )}
                {activeTab === 2 && showPatientDocuments === "edit-note" && (
                  <EditNote
                    patientId={id}
                    noteId={noteId}
                    patientName={data?.user.firstName}
                    setShowPatientDocuments={setShowPatientDocuments}
                    setEditClick={setEditClick}
                  />
                )}
                {activeTab === 2 &&
                  showPatientDocuments === "view-careplan" && (
                    <ViewCareplan careplanId={careplanId} />
                  )}
                {activeTab === 3 && <WeeklyPatientReport patientId={id} />}
                {activeTab === 4 && <SharedSummaries providerId={id} />}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PatientOverview;
