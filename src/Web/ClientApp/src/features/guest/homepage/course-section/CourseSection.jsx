import { Box } from "@mui/material";
import CourseSubSection from "./CourseSubSection";
import { completeCourses } from "./MockData";
import { PopoverProvider } from "../../../../context/PopoverContext";
import useGetCourses from "../../../../hooks/useGetCourses";
import LoadingSpinner from "../../../../components/LoadingSpinner";
// Sample data matching your image

function CourseSection() {
  const { data: courseData, isLoading } = useGetCourses(1, 12);

  if (isLoading) {
    <LoadingSpinner />;
  }

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
          title="Trending Course"
          subtitle="We know the best things for You. Top picks for You."
          courses={courseData?.items ?? []}
          type="course"
        />
      </Box>
    </PopoverProvider>
  );
}

export default CourseSection;
