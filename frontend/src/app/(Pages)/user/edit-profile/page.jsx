"use client";
import React from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Container, Row, Card, Col } from "reactstrap";
import ChangePassword from "@/Components/Users/EditProfile/ChangePassword/ChangePassword";
import EditProfileForm from "@/Components/Users/EditProfile/EditProfileForm/EditProfileForm";

const page = () => {
  return (
    <div>
      <Breadcrumbs mainTitle={"Edit Profile"} parent={"User"} />
      <Container fluid className="edit-profile">
        <Row>
          <ChangePassword />
          <EditProfileForm />
        </Row>
      </Container>
    </div>
  );
};

export default page;
