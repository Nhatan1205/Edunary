import { Box } from "@mui/material";
import CourseSubSection from "./CourseSubSection";
import {
  completeCourses,
  kitaniStudioCourses,
  trendingCourses,
} from "./MockData";
import { PopoverProvider } from "../../../../context/PopoverContext";
// Sample data matching your image

function CourseSection() {
  return (
    <PopoverProvider>
      <Box sx={{ py: 4 }}>
        <CourseSubSection
          title="Complete your Course"
          subtitle="We know the best things for You. Top picks for You."
          courses={completeCourses}
          type="user"
        />

        <CourseSubSection
          title="More from Kitani Studio"
          subtitle="We know the best things for You. Top picks for You."
          courses={kitaniStudioCourses}
          type="course"
        />

        <CourseSubSection
          title="Trending Course"
          subtitle="We know the best things for You. Top picks for You."
          courses={trendingCourses}
          type="course"
        />
      </Box>
    </PopoverProvider>
  );
}

export default CourseSection;
