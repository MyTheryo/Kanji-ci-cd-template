import React from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Container, Row } from "reactstrap";
import Profile from "../../../../Components/Users/UsersProfile/Profile/Profile";

const page = () => {
  return (
    <div>
      <Breadcrumbs mainTitle={"Profile"} parent={"User"} />
      <Container fluid>
        <div className="user-profile">
          <Row>
            <Profile />
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default page;
