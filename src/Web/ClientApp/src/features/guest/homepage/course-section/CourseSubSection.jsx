import { Container, Row } from "reactstrap";
import { Typography, Box } from "@mui/material";
import CourseCard from "./CourseCard";
import UserCourseCard from "./UserCourseCard";
import { PopoverProvider } from "../../../../context/PopoverContext";

function CourseSubSection({ title, subtitle, courses, type = "course" }) {
  return (
    <PopoverProvider>
      <Container>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              color: "#333",
              mb: 1,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: "1rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Row>
          {courses.map((course, index) =>
            type === "user" ? (
              <UserCourseCard key={index} course={course} />
            ) : (
              <CourseCard key={course.id} course={course} />
            )
          )}
        </Row>
      </Container>
    </PopoverProvider>
  );
}

export default CourseSubSection;
