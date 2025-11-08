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

function UserCourseCard({ course }) {
  const {
    imageUrl,
    title,
    level,
  } = course;

  return (
    <Col xs={6} md={4} lg={3} className="mb-4">
      <Card
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
            borderRadius: 2,
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
                mb: 1,
                color: "#333",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                height: "2.6em",
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box sx={{ mt: "auto" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.75rem",
                mb: 1,
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {level}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontSize: "0.8rem",
                mb: 1,
              }}
            >
              4/32 Videos Completed
            </Typography>

            <LinearProgress
              variant="determinate"
              value={30}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "#f0f0f0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#4CAF50",
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
