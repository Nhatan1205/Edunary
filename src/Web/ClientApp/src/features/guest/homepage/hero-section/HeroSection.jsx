import { Container, Row, Col } from "reactstrap";
import StatsCard from "./StatsCard";
import ImageProfile from "./ImageProfile";
import { Badge, Typography } from "@mui/material";
import femaleStudentImg from "../../../../assets/images/female-student-with-glasses-holding-books.jpg";
import maleStudentImg from "../../../../assets/images/happy-male-student-with-curly-hair-wearing-green-p.jpg";
import { Circle } from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";

const decorativeCircles = [
  {
    color: "#fb923c",
    size: 14,
    lgSize: 18,
    position: { top: "40px", right: "140px" },
  },
  {
    color: "#4ade80",
    size: 14,
    lgSize: 18,
    position: { top: "80px", right: "180px" },
  },
  {
    color: "#60a5fa",
    size: 14,
    lgSize: 18,
    position: { bottom: "80px", left: "140px" },
  },
];

function HeroSection() {
  const isSmUp = useMediaQuery("(min-width:576px)");
  const isMdUp = useMediaQuery("(min-width:768px)");
  const isLgUp = useMediaQuery("(min-width:992px)");

  return (
    <section
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #f5e5e5 0%, #e8f3ef 100%)",
        overflow: "hidden",
        marginTop: "0",
        padding: 0,
      }}
    >
      {/* Decorative elements - hidden on mobile */}
      {decorativeCircles.map((circle, index) => (
        <Circle
          key={index}
          style={{
            color: circle.color,
            position: "absolute",
            width: isLgUp ? circle.lgSize : circle.size,
            height: isLgUp ? circle.lgSize : circle.size,
            ...circle.position,
            display: isMdUp ? "block" : "none",
          }}
        />
      ))}

      <Container fluid="xl" className="py-5 px-5">
        <Row className="align-items-center justify-content-center">
          {/* Left Content */}
          <Col md={12} lg={6} className="d-flex justify-content-center">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: isLgUp ? "2rem" : "1.5rem",
                textAlign: isLgUp ? "left" : "center",
                maxWidth: isLgUp ? "none" : "500px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: isLgUp ? "flex-start" : "center",
                }}
              >
                <Badge
                  sx={{
                    backgroundColor: "brand.main",
                    color: "text.inverse",
                    fontWeight: 500,
                    padding: "0.5rem 1rem",
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: "brand.main",
                  }}
                >
                  Learn & Get Certificates
                </Badge>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: isLgUp ? "1.5rem" : "1rem",
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: isLgUp ? "4rem" : isSmUp ? "2.5rem" : "2rem",
                    fontWeight: "bold",
                    color: "#111827",
                    lineHeight: 1.1,
                    m: 0,
                  }}
                  variant="h1"
                >
                  Free Online Courses
                  <br />
                  <span>With Certificates &</span>
                  <br />
                  Diplomas
                </Typography>

                <h6
                  style={{
                    color: "#6b7280",
                    fontSize: isLgUp ? "1.25rem" : "1rem",
                    margin: 0,
                    maxWidth: isLgUp ? "400px" : "none",
                  }}
                >
                  25 Million Learners. 15 Years 100%
                </h6>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: isLgUp ? "flex-start" : "center",
                }}
              >
                <Badge
                  sx={{
                    backgroundColor: "secondaryBrand.main",
                    color: "text.inverse",
                    fontWeight: 500,
                    padding: "0.5rem 1rem",
                    borderRadius: 20,
                    border: "1px solid",
                    borderColor: "secondaryBrand.main",
                  }}
                >
                  sign up with us to day
                </Badge>
              </div>
            </div>
          </Col>

          {/* Right Content - Student Profiles and Stats - Hidden on mobile */}
          <Col lg={6} className="d-none d-lg-block">
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              {/* Top Stats Card */}
              <div style={{ alignSelf: "flex-start" }}>
                <StatsCard
                  number="2k+"
                  label="Student has enrolled"
                  variant="yellow"
                />
              </div>

              {/* Student Profiles */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
              >
                <ImageProfile
                  imageUrl={femaleStudentImg}
                  sx={{
                    width: { xs: 160, lg: 200 },
                    height: { xs: 340, lg: 380 },
                  }}
                />

                <ImageProfile
                  imageUrl={maleStudentImg}
                  sx={{
                    width: { xs: 220, lg: 260 },
                    height: { xs: 460, lg: 500 },
                  }}
                />
              </div>

              {/* Bottom Stats Card */}
              <div style={{ alignSelf: "flex-end" }}>
                <StatsCard
                  number="5.8k"
                  label="Success Courses"
                  variant="white"
                />
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

export default HeroSection;
