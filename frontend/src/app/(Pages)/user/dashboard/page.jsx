"use client";
import React from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Card, CardBody, CardHeader, Col, Row, Container } from "reactstrap";
import Loader from "@/Components/Loader";
import { useSession } from "next-auth/react";
import {
  useGetAllActivitiesQuery,
  useGetMoodByDateQuery,
  useGetMoodByWeekQuery,
  useGetMoodCountByTwoWeeksQuery,
  useGetMoodCountQuery,
} from "@/Redux/features/mood/moodApi";
import AiCalendar from "@/Components/Calendar";
import MoodChart from "@/Components/Users/Dashboard/MoodChart";
import MoodCount from "@/Components/Users/Dashboard/MoodCount";
import CurrentWeek from "@/Components/Users/Dashboard/CurrentWeek";
import ActivityChart from "@/Components/Users/Dashboard/ActivityChart";
import YearInPixel from "@/Components/Users/Dashboard/YearInPixel";
const page = () => {
  const { data: session, status } = useSession();
  const {
    data: calenData,
    error: calenError,
    isLoading: calenLoading,
  } = useGetMoodByDateQuery("", { refetchOnMountOrArgChange: true });
  const {
    data: moodData,
    error: moodChartErrror,
    isLoading: moodChartLoading,
  } = useGetMoodCountQuery("", { refetchOnMountOrArgChange: true });
  const { data: moodCountData, isLoading: moodCountLoading } =
    useGetMoodCountByTwoWeeksQuery("", {
      refetchOnMountOrArgChange: true,
    });
  const {
    data: currentWeekData,
    isLoading,
    refetch,
  } = useGetMoodByWeekQuery({ refetch: true });
  const {
    data: ActivityData,
    error: activityData,
    isLoading: activityLoading,
  } = useGetAllActivitiesQuery("", { refetchOnMountOrArgChange: true });

  if (
    calenLoading ||
    activityLoading ||
    moodChartLoading ||
    isLoading ||
    status === "loading"
  ) {
    return <Loader />;
  }

  return (
    <div>
      <Breadcrumbs mainTitle={"Dashboard"} parent={"User"} />
      <Container fluid>
        <div className="d-flex p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">
            Hello {session?.user?.firstName},
          </h2>
        </div>
        <Row>
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Calendar</h4>
              </CardHeader>
              <CardBody>
                <AiCalendar calenData={calenData} />
              </CardBody>
            </Card>
          </Col>
          {/* <Col sm="12" md="6">
            <Card className="calendar-box" style={{ height: "95%" }}>
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Mood Chart</h4>
              </CardHeader>
              <CardBody>
                <MoodChart moodData={moodData} />
              </CardBody>
            </Card>
          </Col> */}
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Current Week</h4>
              </CardHeader>
              <CardBody>
                <CurrentWeek data={currentWeekData} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Mood Over Time</h4>
              </CardHeader>
              <CardBody>
                <MoodCount moodCountData={moodCountData} />
              </CardBody>
            </Card>
          </Col>
          {/* <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Current Week</h4>
              </CardHeader>
              <CardBody>
                <CurrentWeek data={currentWeekData} />
              </CardBody>
            </Card>
          </Col> */}
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Activity Chart</h4>
              </CardHeader>
              <CardBody>
                <ActivityChart ActivityData={ActivityData} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          {/* <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Activity Chart</h4>
              </CardHeader>
              <CardBody>
                <ActivityChart ActivityData={ActivityData} />
              </CardBody>
            </Card>
          </Col> */}
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="border-bottom d-flex justify-content-center align-items-center bg-primary">
                <h4 className="text-white">Year In Pixel</h4>
              </CardHeader>
              <CardBody>
                <YearInPixel />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default page;
