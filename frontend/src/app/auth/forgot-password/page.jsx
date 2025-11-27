"use client";
import { Col, Container, Row } from "reactstrap";
import Forgot from "../../../Components/Authentication/Forgot";

const ForgotPassword = () => {
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs="12" className="p-0">
          <div className="login-card">
            <Forgot />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
