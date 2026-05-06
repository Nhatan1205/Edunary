import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { Container, Row, Col } from "reactstrap";
import { Link as RouterLink } from "react-router";
import useGetPublicRoadmaps from "../../../../hooks/roadmap-hooks/useGetPublicRoadmaps";
import useScrollAnimation from "../../../../hooks/common/useScrollAnimation";
import CareerPathMiniCard from "./CareerPathMiniCard";

function CareerPathSection() {
  const titleRef = useScrollAnimation("fade-in-up");
  const gridRef = useScrollAnimation("fade-in-up", { threshold: 0.08 });

  const { data, isLoading } = useGetPublicRoadmaps({ pageSize: 8 });
  const roadmaps = data?.items ?? [];

  if (!isLoading && roadmaps.length === 0) return null;

  return (
    <Box
      component="section"
      sx={{
        background: "linear-gradient(135deg, #E9FAF7 0%, #F5FCFA 50%, #FFFFFF 100%)",
        py: { xs: 6, md: 9 },
      }}
    >
      <Container>
        {/* Section header — centered like ZTM */}
        <Box
          ref={titleRef}
          sx={{ textAlign: "center", mb: { xs: 4, md: 5 }, maxWidth: 580, mx: "auto" }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mb: 1.5,
              fontSize: { xs: "1.6rem", md: "2.1rem" },
            }}
          >
            Zero to Job-Ready in Record Time
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.tertiary",
              fontSize: "1rem",
              lineHeight: 1.7,
              mb: 1.5,
            }}
          >
            Our Career Paths give you a step-by-step roadmap to go from any background to job-ready.
            Pick one of the most popular paths below,{" "}
            <Button
              component={RouterLink}
              to="/career-paths"
              variant="text"
              sx={{
                p: 0,
                minWidth: 0,
                color: "brand.dark",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "underline",
                verticalAlign: "baseline",
                lineHeight: "inherit",
                "&:hover": { bgcolor: "transparent", color: "brand.darker" },
              }}
            >
              explore all career paths
            </Button>
            , or{" "}
            <Button
              component={RouterLink}
              to="/ai/career-path"
              variant="text"
              sx={{
                p: 0,
                minWidth: 0,
                color: "brand.dark",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "underline",
                verticalAlign: "baseline",
                lineHeight: "inherit",
                "&:hover": { bgcolor: "transparent", color: "brand.darker" },
              }}
            >
              generate one tailored to you
            </Button>
            .
          </Typography>
        </Box>

        {/* 2-column grid of cards */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={36} sx={{ color: "brand.main" }} />
          </Box>
        ) : (
          <Box ref={gridRef}>
            <Row className="g-3">
              {roadmaps.map((path, index) => (
                <Col xs={12} md={6} key={path.id}>
                  <CareerPathMiniCard
                    path={path}
                  />
                </Col>
              ))}
            </Row>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default CareerPathSection;
