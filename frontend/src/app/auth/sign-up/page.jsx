"use client";
import { Col, Container, Row } from "reactstrap";
import CommonRegisterForm from "../../../Components/Authentication/Common/CommonRegisterForm";

const UserSignUp = () => {
  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        <Col xs="12" className="p-0">
          <div className="login-card">
            <CommonRegisterForm />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserSignUp;
