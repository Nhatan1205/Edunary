import { ArrowBack } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Chip,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import { Container } from "reactstrap";
import { Link as RouterLink, useParams } from "react-router";
import useGetCourseById from "../../../../hooks/useGetCourseById";

function CourseManageHeader() {
  const { courseId } = useParams();
  const { data: courseData } = useGetCourseById(courseId);
  return (
    <AppBar
      position="fixed"
      sx={{
        bgcolor: "#1c1d1f",
        boxShadow: "none",
        zIndex: 1201,
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <Container fluid className="px-0">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <IconButton
              component={RouterLink}
              to="/instructor/courses"
              disableTouchRipple
              color="inherit"
              sx={{
                padding: "10px 24px",
                display: "flex",
                alignItems: "center",
                ml: 1,
              }}
            >
              <ArrowBack />
              <Typography
                variant="body1"
                sx={{
                  ml: 1,
                  display: { xs: "none", md: "block" },
                }}
              >
                Back to courses
              </Typography>
            </IconButton>

            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                maxWidth: { xs: "50%", sm: "60%", md: "50%" },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1rem", md: "1.25rem" },
                  textAlign: "center",
                  whiteSpace: { xs: "nowrap", sm: "normal" },
                  overflow: { xs: "hidden", sm: "visible" },
                  textOverflow: { xs: "ellipsis", sm: "clip" },
                }}
              >
                {courseData ? courseData.title : ""}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: { xs: "0 0 auto", sm: "0 0 auto" },
                minWidth: { xs: "auto", sm: "100px" },
                justifyContent: "flex-end",
                mr: 1,
              }}
            >
              <Chip
                label={courseData ? (courseData.status === 0 ? "DRAFT" : "PUBLIC") : "LOADING"}
                size="small"
                sx={{
                  bgcolor: "#6a6f73",
                  color: "white",
                  fontSize: { xs: "0.7rem", sm: "0.8125rem" },
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
