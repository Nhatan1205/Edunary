import { Box } from "@mui/material";
import CourseSubSection from "./CourseSubSection";
import { PopoverProvider } from "../../../../context/PopoverContext";
import useGetCourses from "../../../../hooks/useGetCourses";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetCoursesStudent from "../../../../hooks/useGetCoursesStudent";
// Sample data matching your image

function CourseSection() {
  const { data: courseData, isLoading: isCourseLoading } = useGetCourses(1, 12);
  const {data: courseStudentData, isLoading: isCourseStudentLoading} = useGetCoursesStudent(1,4);

  console.log("Fetched courseStudentData data:", courseStudentData);

  if (isCourseLoading || isCourseStudentLoading) {
    <LoadingSpinner />;
  }

  return (
    <PopoverProvider>
      <Box sx={{ py: 4 }}>
        <CourseSubSection
          title="Complete your Course"
          subtitle="We know the best things for You. Top picks for You."
          courses={courseStudentData?.items ?? []}
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
