import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  LinearProgress,
  Box,
} from "@mui/material";
import { Col } from "reactstrap";
import DefaultImage from "../../../../assets/images/default.jpg";
import { Link as RouterLink } from "react-router";

function UserCourseCard({ course }) {
  const {
    id,
    imageUrl,
    title,
    instructorName,
    totalLectures,
    completedLectures,
  } = course;

  const completed = completedLectures || 0;
  const total = totalLectures || 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Col xs={6} md={4} lg={3} className="mb-4">
      <Card
        component={RouterLink}
        to={`/course/${id}/learn`}
        sx={{
          height: "320px",
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform 0.2s ease-in-out",
          bgcolor: "background.default",
          boxShadow: "none",
          textDecoration: "none",
          "&:hover": {
            "& .MuiCardMedia-root": {
              filter: "brightness(0.5)",
            },
          },
        }}
      >
        <CardMedia
          component="img"
          height="160"
          image={imageUrl ? imageUrl : DefaultImage}
          alt={title}
          sx={{
            objectFit: "cover",
            filter: "brightness(0.8)",
            borderRadius: 1,
            flexShrink: 0,
            transition: "filter 0.3s ease, transform 0.3s ease",
          }}
        />

        <CardContent
          sx={{
            p: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontSize: "0.9rem",
                fontWeight: 600,
                lineHeight: 1.3,
                height: "2.6em",
                mb: 1,
                color: "#333",
                wordBreak: "break-word",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ mt: "auto" }}>
            {instructorName && (
              <Typography
                variant="body2"
                sx={{
                  color: "#666",
                  fontSize: "0.75rem",
                  mb: 1,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {instructorName}
              </Typography>
            )}

            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.8rem",
                mb: 1,
              }}
            >
              {completed} of {total} complete
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "#f0f0f0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: progress > 50 ? "#4CAF50" : "#ff9800",
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Col>
  );
}

export default UserCourseCard;
