import { Container, Row, Col } from "reactstrap";
import StatsCard from "./StatsCard";
import ImageProfile from "./ImageProfile";
import { Badge, Typography } from "@mui/material";

function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "60vh",
        background: "linear-gradient(135deg, #f5e5e5 0%, #e8f3ef 100%)",
        overflow: "hidden",
        marginTop: "0",
        padding: 0,
      }}
      className="hero-section"
    >
      {/* Custom CSS for responsive height */}
      <style jsx>{`
        @media (min-width: 992px) {
          .hero-section {
            min-height: 70vh !important;
          }
        }
      `}</style>

      {/* Decorative elements - hidden on mobile */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          width: "12px",
          height: "12px",
          backgroundColor: "#fb923c",
          borderRadius: "50%",
        }}
        className="d-none d-md-block decorative-circle-1"
      />
      <style jsx>{`
        @media (min-width: 992px) {
          .decorative-circle-1 {
            top: 80px !important;
            right: 80px !important;
            width: 16px !important;
            height: 16px !important;
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "80px",
          width: "8px",
          height: "8px",
          backgroundColor: "#4ade80",
          borderRadius: "50%",
        }}
        className="d-none d-md-block decorative-circle-2"
      />
      <style jsx>{`
        @media (min-width: 992px) {
          .decorative-circle-2 {
            top: 160px !important;
            right: 160px !important;
            width: 12px !important;
            height: 12px !important;
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "40px",
          width: "8px",
          height: "8px",
          backgroundColor: "#60a5fa",
          borderRadius: "50%",
        }}
        className="d-none d-md-block decorative-circle-3"
      />
      <style jsx>{`
        @media (min-width: 992px) {
          .decorative-circle-3 {
            bottom: 160px !important;
            left: 80px !important;
            width: 12px !important;
            height: 12px !important;
          }
        }
      `}</style>

      <Container fluid="xl" className="py-2 py-sm-4">
        <style jsx>{`
          @media (min-width: 992px) {
            .hero-container {
              padding-top: 3rem !important;
              padding-bottom: 3rem !important;
            }
          }
        `}</style>

        <Row
          className="align-items-center justify-content-center hero-container"
          style={{ rowGap: "4.5rem" }}
        >
          <style jsx>{`
            @media (min-width: 992px) {
              .hero-container {
                row-gap: 6rem !important;
              }
            }
          `}</style>

          {/* Left Content */}
          <Col xs={12} lg={6} className="d-flex justify-content-center">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                textAlign: "center",
                maxWidth: "500px",
                width: "100%",
              }}
              className="hero-content"
            >
              <style jsx>{`
                @media (min-width: 992px) {
                  .hero-content {
                    gap: 2rem !important;
                    text-align: left !important;
                    max-width: none !important;
                  }
                }
              `}</style>

              <div className="d-flex justify-content-center justify-content-lg-start">
                <Badge
                  pill
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
                  gap: "1rem",
                }}
                className="hero-text-section"
              >
                <style jsx>{`
                  @media (min-width: 992px) {
                    .hero-text-section {
                      gap: 1.5rem !important;
                    }
                  }
                `}</style>

                <Typography
                  component="h1"
                  className="hero-title"
                  sx={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    color: "#111827",
                    lineHeight: 1.1,
                    m: 0, // margin: 0
                  }}
                  variant="h1"
                >
                  <style jsx>{`
                    @media (min-width: 576px) {
                      .hero-title {
                        font-size: 2.5rem !important;
                      }
                    }
                    @media (min-width: 992px) {
                      .hero-title {
                        font-size: 4rem !important;
                      }
                    }
                  `}</style>
                  Free Online Courses
                  <br />
                  <span>With Certificates &</span>
                  <br />
                  Diplomas
                </Typography>

                <h6
                  style={{
                    color: "#6b7280",
                    fontSize: "1rem",
                    margin: 0,
                  }}
                  className="hero-subtitle"
                >
                  <style jsx>{`
                    @media (min-width: 992px) {
                      .hero-subtitle {
                        font-size: 1.25rem !important;
                        max-width: 400px;
                      }
                    }
                  `}</style>
                  25 Million Learners. 15 Years 100%
                </h6>
              </div>

              <div className="d-flex justify-content-center justify-content-lg-start">
                <Badge
                  pill
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
          <Col xs={12} lg={6} className="d-none d-lg-block">
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
                  imageUrl="/images/female-student-with-glasses-holding-books.jpg"
                  sx={{
                    width: { xs: 160, lg: 200 },
                    height: { xs: 340, lg: 380 },
                  }}
                />

                <ImageProfile
                  imageUrl="/images/happy-male-student-with-curly-hair-wearing-green-p.jpg"
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
