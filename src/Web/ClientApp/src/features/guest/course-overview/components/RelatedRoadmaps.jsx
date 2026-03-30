import { Box, Typography, Chip, Divider } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import RouteIcon from '@mui/icons-material/Route';
import { useNavigate } from "react-router-dom";
import { Row, Col } from "reactstrap";
import useGetRelatedRoadmaps from "../../../../hooks/roadmap-hooks/useGetRelatedRoadmaps";

function RelatedRoadmapCard({ roadmap }) {
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/career-paths/${roadmap.id}`)}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        padding: "24px 28px",
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(63,204,178,0.13)",
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Topic chip */}
      <Chip
        label={roadmap.topicTitle}
        size="small"
        sx={{
          bgcolor: "background.muted",
          color: "brand.darker",
          fontWeight: 600,
          fontSize: 12,
          mb: 1.5,
          alignSelf: "flex-start",
        }}
      />

      {/* Title */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          mb: 1.25,
        }}
      >
        {roadmap.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        sx={{
          color: "text.tertiary",
          mb: 2.25,
          lineHeight: 1.65,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minHeight: "calc(1.65em * 3)",
          flexGrow: 1,
        }}
      >
        {roadmap.description}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Course count */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          color: "text.tertiary",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <SchoolIcon sx={{ fontSize: 17, color: "brand.main" }} />
        <span>{roadmap.courseCount} courses</span>
      </Box>
    </Box>
  );
}

function RelatedRoadmaps({ courseId }) {
  const { data: roadmaps, isLoading } = useGetRelatedRoadmaps(courseId);

  if (isLoading || !roadmaps?.length) return null;

  return (
    <Box sx={{ py: 6 }}>
      {/* Section title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.25,
          mb: 4,
        }}
      >
        <RouteIcon sx={{ fontSize: 28 }} />
        <Typography
          variant="h2"
          sx={{ fontWeight: 700, color: "text.primary", textAlign: "center" }}
        >
          Related Career Paths
        </Typography>
      </Box>

      {/* Subtitle */}
      <Typography
        variant="body1"
        sx={{
          color: "text.tertiary",
          textAlign: "center",
          mb: 4,
          mt: -2,
        }}
      >
        Explore career paths that include this course
      </Typography>

      <Row className="g-4">
        {roadmaps.map((roadmap) => (
          <Col key={roadmap.id} xs={12} md={6} lg={4}>
            <RelatedRoadmapCard roadmap={roadmap} />
          </Col>
        ))}
      </Row>
    </Box>
  );
}

export default RelatedRoadmaps;
