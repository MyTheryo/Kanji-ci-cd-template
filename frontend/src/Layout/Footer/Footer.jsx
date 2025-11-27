import SVG from "../../CommonComponent/SVG";
import { Col, Container, Row } from "reactstrap";

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col md="6" className="footer-copyright">
            <p className="mb-0">
              Copyright {new Date().getFullYear()} © Theryo.ai
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
