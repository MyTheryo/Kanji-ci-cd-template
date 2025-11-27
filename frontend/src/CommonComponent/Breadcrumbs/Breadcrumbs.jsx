"use client";
import { Breadcrumb, BreadcrumbItem, Col, Container, Row } from "reactstrap";
import SVG from "../SVG";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Breadcrumbs = ({ mainTitle, parent }) => {
  const { data: session } = useSession();
  return (
    <Container fluid>
      <Row className="page-title">
        <Col sm="6">
          <h3>{mainTitle}</h3>
        </Col>
        <Col sm="6">
          <Breadcrumb className="justify-content-sm-end align-items-center">
            <BreadcrumbItem>
              <Link
                href={`/${
                  session?.user?.userRole === "Provider" ? "provider" : "user"
                }/home`}
              >
                <SVG iconId="Home" className="svg-color" />
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>{parent}</BreadcrumbItem>
            <BreadcrumbItem className="active">{mainTitle}</BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row>
    </Container>
  );
};

export default Breadcrumbs;
