import { Box } from "@mui/material";
import CourseSubSection from "./CourseSubSection";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import useGetCoursesStudent from "../../../../hooks/useGetCoursesStudent";
import { useAuth } from "../../../../context/AuthContext";
import useGetHomepageCourses from "../../../../hooks/useGetCoursesHomepage";
// Sample data matching your image

function CourseSection() {
  const { isAuthenticated } = useAuth();
  const { data: courseData, isLoading: isCourseLoading } = useGetHomepageCourses();
  const {data: courseStudentData, isLoading: isCourseStudentLoading} = useGetCoursesStudent(1,4,isAuthenticated);

  if (isCourseLoading || isCourseStudentLoading) {
    <LoadingSpinner />;
  }

  return (
      <Box sx={{ py: 4 }}>
        { (isAuthenticated && courseStudentData?.items.length > 0) && (
          <CourseSubSection
            title="Complete your Course"
            subtitle="Pick up right where you left off."
            courses={courseStudentData?.items ?? []}
            isLoading={isCourseStudentLoading}
            type="user"
            buttonText="My Learning"
          />
        )}
        <CourseSubSection
          title="Trending Course"
          subtitle="We know the best things for You. Top picks for You."
          courses={courseData?.newCourses ?? []}
          isLoading={isCourseLoading}
          type="course"
          buttonText="View All Trending Courses"
          buttonPath="/course/search?sort=newest"
        />
        <CourseSubSection
          title="Most Popular Courses"
          subtitle="These courses are loved by thousands of learners."
          courses={courseData?.popularCourses ?? []}
          isLoading={isCourseLoading}
          type="course"
          buttonText="View All Popular Courses"
          buttonPath="/course/search?sort=num_students"
        />
        <CourseSubSection
          title="Recommended to you based on ratings"
          subtitle="Handpicked courses based on learner ratings."
          courses={courseData?.topRatedCourses ?? []}
          isLoading={isCourseLoading}
          type="course"
          buttonText="View All Top Rated Courses"
          buttonPath="/course/search?sort=highest_rated"
        />
      </Box>
  );
}

export default CourseSection;
