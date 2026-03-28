import { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Box, Typography, CircularProgress } from "@mui/material";
import HeroSection from "./components/HeroSection";
import CareerPathCard from "./components/CareerPathCard";
import useGetRoadmapTopics from "../../../hooks/roadmap-hooks/useGetRoadmapTopics";
import useGetPublicRoadmaps from "../../../hooks/roadmap-hooks/useGetPublicRoadmaps";

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
              <Typography sx={{ color: "text.tertiary", mt: 3 }}>
                No career paths found for this topic.
              </Typography>
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
