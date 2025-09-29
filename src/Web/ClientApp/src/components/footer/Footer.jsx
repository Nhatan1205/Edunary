import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Divider } from "@mui/material";
function Footer() {
  return (
    <footer className="bg-dark text-white py-5">
      <Container>
        {/* Main Footer Content */}
        <Row className="mb-4">
          {/* Company Column */}
          <Col xs="12" md="6" lg="2">
            <h5 className="mb-3">Company</h5>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/about"
                  className="text-secondary text-decoration-none"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-secondary text-decoration-none"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/press"
                  className="text-secondary text-decoration-none"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-secondary text-decoration-none"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </Col>

          {/* Work With Us Column */}
          <Col xs="12" md="6" lg="2">
            <h5 className="mb-3">Work With Us</h5>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/affiliate"
                  className="text-secondary text-decoration-none"
                >
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link
                  to="/partnerships"
                  className="text-secondary text-decoration-none"
                >
                  Partnerships
                </Link>
              </li>
            </ul>
          </Col>

          {/* Teach with Us Column */}
          <Col xs="12" md="6" lg="3">
            <h5 className="mb-3">Teach with Us</h5>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/become-teacher"
                  className="text-secondary text-decoration-none"
                >
                  Become a Teacher
                </Link>
              </li>
              <li>
                <Link
                  to="/teacher-help"
                  className="text-secondary text-decoration-none"
                >
                  Teacher Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/teacher-rules"
                  className="text-secondary text-decoration-none"
                >
                  Teacher Rules & Requirements
                </Link>
              </li>
            </ul>
          </Col>

          {/* Shop Column */}
          <Col xs="12" md="6" lg="3">
            <h5 className="mb-3">Shop</h5>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/gift-memberships"
                  className="text-secondary text-decoration-none"
                >
                  Gift Memberships
                </Link>
              </li>
              <li>
                <Link
                  to="/digital-products"
                  className="text-secondary text-decoration-none"
                >
                  Digital Products
                </Link>
              </li>
              <li>
                <Link
                  to="/sessions"
                  className="text-secondary text-decoration-none"
                >
                  1-on-1 Sessions
                </Link>
              </li>
              <li>
                <Link
                  to="/live-sessions"
                  className="text-secondary text-decoration-none"
                >
                  Live Sessions
                </Link>
              </li>
            </ul>
          </Col>

          <Col xs="12" md="6" lg="2">
            <h5 className="mb-3">Our Contact</h5>
            <div className="d-grid gap-2">
              <Link
                to="/appstore"
                className="btn btn-outline-secondary d-flex align-items-center"
              >
                <span className="fs-4 me-2">
                  <LocalPhoneIcon />
                </span>
                <div className="text-start">
                  <div className="small">Phone number</div>
                  <div className="fw-semibold">+84 0121345678</div>
                </div>
              </Link>

              <Link
                to="/googleplay"
                className="btn btn-outline-secondary d-flex align-items-center"
              >
                <span className="fs-4 me-2">
                  <MailOutlineIcon />
                </span>
                <div className="text-start">
                  <div className="small">Our Gmail</div>
                  <div className="fw-semibold">edunary@gmail.com</div>
                </div>
              </Link>
            </div>
          </Col>
        </Row>

        {/* Separator Line */}
        <Divider sx={{ borderColor: "divider", borderWidth: "1px" }} />

        {/* Bottom Footer */}
        <Row className="text-secondary small mt-4">
          <Col className="d-flex flex-wrap align-items-center justify-content-center gap-3">
            <span>© Edunary, Inc. 2025</span>
            <span className="d-none d-md-inline">•</span>
            <Link to="/help" className="text-decoration-none text-light">
              Help
            </Link>
            <span className="d-none d-md-inline">•</span>
            <Link to="/privacy" className="text-decoration-none text-light">
              Privacy
            </Link>
            <span className="d-none d-md-inline">•</span>
            <Link to="/terms" className="text-decoration-none text-light">
              Terms
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
