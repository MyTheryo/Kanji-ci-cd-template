"use client";
import { Button, Col, Container } from "reactstrap";
import { BackToHomePage, PageNotFound } from "../../../Constant";
import { useSession } from "next-auth/react";

const CommonError = ({ errorSvg }) => {
  const { data: session } = useSession();
  // Determine the correct home URL based on the user role
  const homeUrl =
    session?.user?.userRole === "Provider"
      ? "/provider/home"
      : session?.user?.userRole === "Admin"
      ? "/admin/all-users"
      : "/user/home";

  return (
    <div className="page-wrapper compact-wrapper">
      <div className="error-wrapper">
        <Container className="my-2">
          <div className="svg-wrraper">{errorSvg}</div>
          <Col md="8" className="offset-md-2">
            <h3>{PageNotFound}</h3>
            <p className="sub-content">
              {
                "The page you are attempting to reach is currently not available. This may be because the page does not exist or has been moved."
              }
            </p>
            <Button color={"primary"} href={homeUrl}>
              {BackToHomePage}
            </Button>
          </Col>
        </Container>
      </div>
    </div>
  );
};

export default CommonError;
