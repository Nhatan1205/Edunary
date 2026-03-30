import { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Box, Typography, CircularProgress } from "@mui/material";
import HeroSection from "./components/HeroSection";
import CareerPathCard from "./components/CareerPathCard";
import useGetRoadmapTopics from "../../../hooks/roadmap-hooks/useGetRoadmapTopics";
import useGetPublicRoadmaps from "../../../hooks/roadmap-hooks/useGetPublicRoadmaps";
import emptyCareerPathsImg from "../../../assets/images/empty-career-paths.png";

export default function CareerPathPage() {
  const [activeTopicId, setActiveTopicId] = useState(null); // null = All

  const { data: topicsData } = useGetRoadmapTopics();
  const topics = topicsData ?? [];

  const { data: roadmapsData, isLoading, isError } = useGetPublicRoadmaps({
    roadmapTopicId: activeTopicId ?? undefined,
  });
  const roadmaps = roadmapsData?.items ?? [];

  const handleTopicClick = (topicId) => {
    setActiveTopicId((prev) => (prev === topicId ? null : topicId));
  };

  const topicItemSx = (isActive) => ({
    padding: "7px 10px",
    borderRadius: "8px",
    mb: 0.25,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: isActive ? 700 : 400,
    color: isActive ? "brand.darker" : "text.secondary",
    bgcolor: isActive ? "background.muted" : "transparent",
    transition: "all 0.15s",
    "&:hover": !isActive ? { bgcolor: "background.alt" } : {},
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <HeroSection />

      <Container style={{ paddingTop: 48, paddingBottom: 64 }}>
        <Row>
          {/* Sidebar – Topics */}
          <Col md={3} lg={2} className="mb-4 mb-md-0">
            <Box
              sx={{
                position: "sticky",
                top: 100,
                bgcolor: "background.paper",
                padding: "20px 16px",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 1.75,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  fontSize: 11,
                }}
              >
                Topics
              </Typography>

              {/* All button */}
              <Box
                onClick={() => setActiveTopicId(null)}
                sx={topicItemSx(activeTopicId === null)}
              >
                All
              </Box>

              {/* Dynamic topics */}
              {topics.map((topic) => (
                <Box
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.id)}
                  sx={topicItemSx(activeTopicId === topic.id)}
                >
                  {topic.title}
                </Box>
              ))}
            </Box>
          </Col>

          {/* Cards */}
          <Col md={9} lg={10}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress size={36} sx={{ color: "brand.main" }} />
              </Box>
            ) : isError ? (
              <Typography sx={{ color: "text.tertiary", mt: 3 }}>
                Failed to load career paths. Please try again later.
              </Typography>
            ) : roadmaps.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '420px',
                  p: 4,
                }}
              >
                <Box
                  component="img"
                  src={emptyCareerPathsImg}
                  alt="No career paths"
                  sx={{
                    width: 200,
                    height: "auto",
                    borderRadius: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    mb: 2,
                  }}
                >
                  No career paths found
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '500px',
                    lineHeight: 1.6,
                  }}
                >
                  {activeTopicId
                    ? "There are no career paths for this topic yet. Try selecting a different topic or browse all paths."
                    : "Career paths will appear here once instructors publish their roadmaps. Check back soon!"}
                </Typography>
              </Box>
            ) : (
              roadmaps.map((path) => (
                <CareerPathCard key={path.id} path={path} />
              ))
            )}
          </Col>
        </Row>
      </Container>
    </Box>
  );
}
