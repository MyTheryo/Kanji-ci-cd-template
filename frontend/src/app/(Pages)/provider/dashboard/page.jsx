import React from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Card, CardBody, CardHeader, Col, Row, Container } from "reactstrap";
import TotalPatientsChart from "@/Components/ProviderComponents/TotalPatientsChart";
import PatientsCount from "@/Components/ProviderComponents/PatientsCount";
import ActiveClientMoM from "@/Components/ProviderComponents/ActiveClientMoM";
import TotalSessionSummaries from "@/Components/ProviderComponents/TotalSessionSummaries";
const page = () => {
  return (
    <div>
      <Breadcrumbs mainTitle={"Dashboard"} parent={"Provider"} />
      <Container fluid>
        <div className="d-flex items-center p-20 mb-3 bg-primary rounded">
          <h2 className="text-white">Welcome to Provider Dashboard</h2>
        </div>
        <Row>
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="d-flex justify-content-center align-items-center">
                <h4 className="text-left w-100">Total Clients Chart</h4>
              </CardHeader>
              <CardBody>
                <TotalPatientsChart />
              </CardBody>
            </Card>
          </Col>
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="d-flex justify-content-center align-items-center">
                <h4 className="w-100 text-left">Clients Summary</h4>
              </CardHeader>
              <CardBody>
                <PatientsCount />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="d-flex justify-content-center align-items-center">
                <h4 className="w-100 text-left">
                  Active Clients Month over month (MoM)
                </h4>
              </CardHeader>
              <CardBody>
                <ActiveClientMoM />
              </CardBody>
            </Card>
          </Col>
          <Col sm="12" md="6">
            <Card className="calendar-box">
              <CardHeader className="d-flex justify-content-center align-items-center">
                <h4 className="w-100 text-left">
                  Total Session Summaries Week over Week
                </h4>
              </CardHeader>
              <CardBody>
                <TotalSessionSummaries />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default page;
