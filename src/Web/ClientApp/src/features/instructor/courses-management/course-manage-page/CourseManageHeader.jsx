import { ArrowBack, AutoStories } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import { Container } from "reactstrap";
import { Link as RouterLink, useParams } from "react-router";
import useGetCourseById from "../../../../hooks/course-hooks/useGetCourseById";

function CourseManageHeader() {
  const { courseId } = useParams();
  const { data: courseData } = useGetCourseById(courseId);

  const isDraft = !courseData || courseData.status === 0;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#1c1d1f",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: 1201,
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: "64px !important" }}>
        <Container fluid className="px-0">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              height: "100%",
            }}
          >
            {/* Left: Back button + Brand */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                component={RouterLink}
                to="/instructor/courses"
                disableTouchRipple
                sx={{
                  color: "rgba(255,255,255,0.75)",
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.75,
                  transition: "all 0.2s",
                  "&:hover": {
                    color: "#3FCCB2",
                    backgroundColor: "rgba(63,204,178,0.1)",
                  },
                }}
              >
                <ArrowBack sx={{ fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.75,
                    fontWeight: 500,
                    display: { xs: "none", md: "block" },
                    letterSpacing: "0.01em",
                  }}
                >
                  Back to courses
                </Typography>
              </IconButton>

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: "rgba(255,255,255,0.12)",
                  mx: 0.5,
                  my: 1,
                  display: { xs: "none", sm: "block" },
                }}
              />

              {/* Brand Logo */}
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    background:
                      "linear-gradient(90deg, #3FCCB2 0%, #49BBBD 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                  }}
                >
                  Edunary
                </Typography>
              </Box>
            </Box>

            {/* Center: Course title */}
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                maxWidth: { xs: "45%", sm: "55%", md: "40%" },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.95rem", md: "1rem" },
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "0.01em",
                }}
              >
                {courseData ? courseData.title : ""}
              </Typography>
            </Box>

            {/* Right: Status chip */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mr: 0.5,
              }}
            >
              <Chip
                label={
                  courseData
                    ? courseData.status === 0
                      ? "DRAFT"
                      : "PUBLIC"
                    : "LOADING"
                }
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  px: 0.5,
                  ...(isDraft
                    ? {
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }
                    : {
                      background:
                        "linear-gradient(135deg, #3FCCB2 0%, #49BBBD 100%)",
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(63,204,178,0.4)",
                    }),
                }}
              />
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

export default CourseManageHeader;
