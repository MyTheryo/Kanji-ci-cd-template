"use client";
import React from "react";
import Breadcrumbs from "../../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Container, Row, Col } from "reactstrap";
import ChangePassword from "../../../../Components/Users/EditProfile/ChangePassword/ChangePassword";
import EditProfileForm from "../../../../Components/Users/EditProfile/EditProfileForm/EditProfileForm";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChangeEmail from "@/Components/Users/EditProfile/ChangeEmail/ChangeEmail";

const page = () => {
  const { data: session, refetch } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session?.user?.userRole === "Admin") {
      router.push("/admin/all-users");
    }
  }, [session]);
  return (
    <div>
      <Breadcrumbs
        mainTitle={"Edit Profile"}
        parent={session?.user?.userRole === "Provider" ? "Provider" : "User"}
      />
      <Container fluid className="edit-profile">
        <Row>
          <Col xl="4">
            <ChangePassword />
            <ChangeEmail email={session?.user?.email} />
          </Col>
          <EditProfileForm />
        </Row>
      </Container>
    </div>
  );
};

export default page;
