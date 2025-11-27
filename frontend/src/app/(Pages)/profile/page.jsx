"use client";
import React from "react";
import Breadcrumbs from "../../../CommonComponent/Breadcrumbs/Breadcrumbs";
import { Container, Row } from "reactstrap";
import Profile from "../../../Components/Users/UsersProfile/Profile/Profile";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session?.user?.userRole === "Admin") {
      router.push("/admin/all-users");
    }
  }, [session]);
  return (
    <div>
      <Breadcrumbs
        mainTitle={"Profile"}
        parent={session?.user?.userRole === "Provider" ? "Provider" : "User"}
      />
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
