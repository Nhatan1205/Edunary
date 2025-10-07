import { Card, CardContent, Typography, Box } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import DefaultImage from "../../../../assets/images/default.jpg";
const CourseCard = ({ course }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isDraft = course.status === 0;
  const navigate = useNavigate();
  function handleEdit() {
    navigate(`/instructor/course/${course.id}/manage`);
  }

  return (
    <Card
      onClick={handleEdit}
      variant="outlined"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: "100%",
        display: "flex",
        mb: 2,
        position: "relative",
        cursor: "pointer",
        borderColor: "divider",
      }}
    >
      <Box
        component="img"
        src={course.imageUrl || DefaultImage}
        alt={course.title}
        sx={{
          width: 140,
          height: 140,
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
      <CardContent
        sx={{
          flex: 1,
          py: 2,
          px: 3,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 3,
            fontSize: "1.1rem",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {course.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Typography
            sx={{
              fontWeight: isDraft ? 700 : 400,
              color: isDraft ? "text.primary" : "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            DRAFT
          </Typography>
          <Typography
            sx={{
              fontWeight: !isDraft ? 700 : 400,
              color: !isDraft ? "text.primary" : "text.secondary",
              fontSize: "0.875rem",
            }}
          >
            Public
          </Typography>
        </Box>

        {/* Hover overlay */}
        {isHovered && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s ease",
            }}
          >
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                color: "primary.main",
                fontSize: "1rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Edit / manage course
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
