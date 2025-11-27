"use client";
import React, { useRef, useEffect } from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Container,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "@/Components/Loader";
import EmojiSelector from "@/Components/Users/Journaling/EmojiSelector";
import EmotionsTable from "@/Components/Users/Home/EmotionsTable";
import AiCalendar from "@/Components/Calendar";
import YourTeam from "@/Components/InvitedDoctors";
import { useGetMoodByDateQuery } from "@/Redux/features/mood/moodApi";
import AddDoctorModal from "@/Components/Users/AddDoctorModal";

const page = () => {
  const [basicTab, setBasicTab] = useState("1");
  const [centred, setCentered] = useState(false);
  const centeredToggle = () => setCentered(!centred);

  const { data: session, status } = useSession();
  const currentUser = session?.user?._id;

  const {
    data: calenData,
    error: calenError,
    isLoading: calenLoading,
  } = useGetMoodByDateQuery(
    { userId: currentUser },
    {
      skip: !currentUser,
      refetchOnMountOrArgChange: true,
    }
  );

  const invitedDoctorsRef = useRef(null);

  if (calenLoading || status === "loading") {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"Home"} parent={"User"} />
      <Container fluid>
        <div className="d-flex justify-content-between items-center p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">Hello {session?.user?.firstName},</h2>
          <button onClick={centeredToggle} className="btn btn-tertiary">
            Add New Provider
          </button>
        </div>
        <Row>
          <Col xl="6" lg="6" sm="12">
            <Card className="profile-greeting" style={{ height: "95%" }}>
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">New Journal Entry</h4>
              </CardHeader>
              <CardBody className="d-flex flex-column justify-content-center align-items-center">
                <div className="d-flex flex-column gap-3">
                  <h1 className="text-center">How Are You?</h1>
                  <EmojiSelector session={session} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col sm="12" lg="6" xl="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Calendar</h4>
              </CardHeader>
              <CardBody className="d-flex justify-content-center align-items-center">
                <AiCalendar calenData={calenData} session={session} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Nav pills className="nav-primary justify-content-center mb-3">
          <NavItem>
            <NavLink
              role="button"
              className={basicTab === "1" ? "active" : ""}
              onClick={() => setBasicTab("1")}
            >
              Entries
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              role="button"
              className={basicTab === "2" ? "active" : ""}
              onClick={() => setBasicTab("2")}
            >
              Your Team
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={basicTab}>
          <TabPane tabId="1">
            <Card>
              <CardBody>
                <EmotionsTable session={session} />
              </CardBody>
            </Card>
          </TabPane>
          <TabPane tabId="2">
            <Card>
              <CardBody>
                <YourTeam ref={invitedDoctorsRef} />
              </CardBody>
            </Card>
          </TabPane>
        </TabContent>
      </Container>
      <AddDoctorModal
        isOpen={centred}
        onClose={centeredToggle}
        refetchInvitedDoctors={() => invitedDoctorsRef.current?.refetch()}
      />
    </div>
  );
};

export default page;
