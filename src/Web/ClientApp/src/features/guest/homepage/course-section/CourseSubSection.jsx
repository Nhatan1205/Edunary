import { Col, Container, Row } from "reactstrap";
import { Typography, Box, Skeleton } from "@mui/material";
import CourseCard from "./CourseCard";
import UserCourseCard from "./UserCourseCard";
import { PopoverProvider } from "../../../../context/PopoverContext";

function CourseSubSection({ title, subtitle, courses,isLoading, type = "course" }) {
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
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Col xs={6} md={4} lg={3} className="mb-4" key={i}>
                  <Skeleton
                    variant="rectangular"
                    height={160}
                    sx={{ borderRadius: 2 }}
                  />
                </Col>
              ))
            : courses.map((course, index) =>
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
