"use client";
import { Container, Row } from "reactstrap";
import Profile from "./Profile/Profile";
import { Users, UsersProfile } from "../../../Constant";
import Breadcrumbs from "../../../CommonComponent/Breadcrumbs/Breadcrumbs";

const UsersProfileContainer = () => {
  return (
    <>
      <Breadcrumbs mainTitle={UsersProfile} parent={Users} />
      <Container fluid>
        <div className="user-profile">
          <Row>
            <Profile />
          </Row>
        </div>
      </Container>
    </>
  );
};

export default UsersProfileContainer;
