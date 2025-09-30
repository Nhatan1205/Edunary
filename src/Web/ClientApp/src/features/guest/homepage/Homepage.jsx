import { Box } from "@mui/material";
import CourseSection from "./course-section/CourseSection";
import HeroSection from "./hero-section/HeroSection";

function Homepage() {
  return (
    <Box component={"main"} sx={{ bgcolor: "background.default" }}>
      <HeroSection />
      <CourseSection />
    </Box>
  );
}

export default Homepage;
