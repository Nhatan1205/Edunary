import { Box } from "@mui/material";
import CourseSection from "./CourseSection/CourseSection";
import HeroSection from "./HeroSection/HeroSection";

function Homepage() {
  return (
    <Box
      component={"main"}
      class="m: 0;"
      sx={{ bgcolor: "background.default" }}
    >
      <HeroSection />
      <CourseSection />
    </Box>
  );
}

export default Homepage;
