import { Container, Row, Col } from "reactstrap";
import StatsCard from "./StatsCard";
import ImageProfile from "./ImageProfile";
import { Button, Typography, Box } from "@mui/material";
import femaleStudentImg from "../../../../assets/images/female-student-with-glasses-holding-books.jpg";
import maleStudentImg from "../../../../assets/images/happy-male-student-with-curly-hair-wearing-green-p.jpg";
import { Circle } from "@mui/icons-material";
import { useMediaQuery } from "@mui/material";
import { Link as RouterLink } from "react-router";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const decorativeCircles = [
  { color: "#81db7eff", size: 14, lgSize: 18, position: { top: "40px", right: "140px" } },
  { color: "#3fcc4bff", size: 14, lgSize: 18, position: { top: "80px", right: "180px" } },
  { color: "#49bd5cff", size: 14, lgSize: 18, position: { bottom: "80px", left: "140px" } },
  { color: "#7edbacff", size: 10, lgSize: 14, position: { top: "120px", left: "60px" } },
  { color: "#5bcc3fff", size: 8, lgSize: 12, position: { bottom: "140px", right: "80px" } },
  { color: "#49bd62ff", size: 12, lgSize: 16, position: { top: "200px", right: "60px" } },
  { color: "#98db7eff", size: 10, lgSize: 14, position: { bottom: "50px", right: "220px" } },
  { color: "#7ecc3fff", size: 8, lgSize: 10, position: { top: "50px", left: "220px" } },
];

function HeroSection() {
  const isSmUp = useMediaQuery("(min-width:576px)");
  const isMdUp = useMediaQuery("(min-width:768px)");
  const isLgUp = useMediaQuery("(min-width:992px)");

  return (
    <section
      style={{
        position: "relative",
        minHeight: "clamp(60vh, 70vh, 100vh)",
        background: "linear-gradient(135deg, #e9faeaff 0%, #EFF7F6 50%, #FCFFFE 100%)",
        overflow: "hidden",
        marginTop: "0",
        padding: 0,
      }}
    >
      {/* Decorative elements - hidden on mobile */}
      {decorativeCircles.map((circle, index) => (
        <Circle
          key={index}
          className="float-y"
          style={{
            color: circle.color,
            position: "absolute",
            width: isLgUp ? circle.lgSize : circle.size,
            height: isLgUp ? circle.lgSize : circle.size,
            ...circle.position,
            display: isMdUp ? "block" : "none",
            opacity: 0.6,
            animationDelay: `${index * 1.5}s`,
          }}
        />
      ))}

      <Container fluid="xl" className="py-2 py-sm-4 my-sm-4 py-lg-4">
        <Row className="align-items-center justify-content-center gy-5 gy-lg-6">
          {/* Left Content */}
          <Col xs={12} lg={6} className="d-flex justify-content-center">
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
              <div className="hero-animate">
                <Box
                  sx={{
                    display: "inline-block",
                    bgcolor: "brand.main",
                    color: "text.inverse",
                    fontWeight: 600,
                    padding: "6px 16px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    letterSpacing: "0.03em",
                  }}
                >
                  🎓 Learn & Get Certificates
                </Box>
              </div>

              <div className="hero-animate-delay-1">
                <Typography
                  component="h1"
                  sx={{
                    fontSize: isLgUp ? "3.5rem" : isSmUp ? "2.5rem" : "2rem",
                    fontWeight: 800,
                    color: "text.primary",
                    lineHeight: 1.1,
                    m: 0,
                  }}
                  variant="h1"
                >
                  Master In-Demand
                  <br />
                  Skills.{" "}
                  <Box
                    component="span"
                    sx={{ color: "brand.dark" }}
                  >
                    Advance
                  </Box>
                  <br />
                  Your Career.
                </Typography>
              </div>

              <div className="hero-animate-delay-2">
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.tertiary",
                    fontSize: isLgUp ? "1.15rem" : "1rem",
                    m: 0,
                    maxWidth: isLgUp ? "440px" : "none",
                    lineHeight: 1.7,
                  }}
                >
                  Join thousands of learners mastering skills through expert-led
                  courses and structured career paths.
                </Typography>
              </div>

              <div
                className="hero-animate-delay-3"
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: isLgUp ? "flex-start" : "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/course/search"
                  size="large"
                  sx={{
                    bgcolor: "brand.main",
                    color: "text.inverse",
                    fontWeight: 700,
                    px: 3.5,
                    py: 1.25,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    boxShadow: "0 4px 14px rgba(63,204,178,0.35)",
                    "&:hover": {
                      bgcolor: "brand.dark",
                      boxShadow: "0 6px 20px rgba(63,204,178,0.45)",
                    },
                  }}
                >
                  Explore Courses
                </Button>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/career-paths"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderColor: "brand.main",
                    color: "brand.dark",
                    fontWeight: 600,
                    px: 3,
                    py: 1.25,
                    borderRadius: "12px",
                    fontSize: "1rem",
                    "&:hover": {
                      borderColor: "brand.dark",
                      bgcolor: "brand.lighter",
                    },
                  }}
                >
                  Career Paths
                </Button>
              </div>
            </div>
          </Col>

          {/* Right Content - Student Profiles and Stats - Hidden on mobile */}
          <Col xs={12} lg={6} style={{ display: isLgUp ? "block" : "none" }}>
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
