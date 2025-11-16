import { Col, Container, Row } from "reactstrap";
import { Typography, Box, Skeleton, Button } from "@mui/material";
import CourseCard from "./CourseCard";
import UserCourseCard from "./UserCourseCard";
import { PopoverProvider } from "../../../../context/PopoverContext";
import { Link as RouterLink } from "react-router";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function CourseSubSection({ title, subtitle, courses,isLoading, type = "course", buttonText, buttonPath = ""}) {
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  fontSize: "1rem",
                  flex: 1,
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                {subtitle}
              </Typography>
            )}
            {buttonText && (
              <Button
                variant="text"
                component={RouterLink}
                to={buttonPath}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: 'brand.dark',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  '&:hover': {
                    color: 'brand.darker',
                  },
                }}
              >
                {buttonText}
              </Button>
            )}
          </Box>
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
