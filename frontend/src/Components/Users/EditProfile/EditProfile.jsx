"use client";
import { Container, Row } from "reactstrap";
import ChangePassword from "./ChangePassword/ChangePassword";
import EditProfileForm from "./EditProfileForm/EditProfileForm";
import AddProjectsAndUpload from "./AddProjectsAndUpload/AddProjectsAndUpload";
import { EditProfile, Users } from "../../../Constant";
import Breadcrumbs from "../../../CommonComponent/Breadcrumbs/Breadcrumbs";

const EditProfileContainer = () => {
  return (
    <>
      <Breadcrumbs mainTitle={EditProfile} parent={Users} />
      <Container fluid className="edit-profile">
        <Row>
          <ChangePassword />
          <EditProfileForm />
          <AddProjectsAndUpload />
        </Row>
      </Container>
    </>
  );
};

export default EditProfileContainer;
