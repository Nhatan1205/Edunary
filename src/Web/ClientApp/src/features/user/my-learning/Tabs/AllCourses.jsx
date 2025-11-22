import { Box, Typography } from '@mui/material'
import { Row, Col } from 'reactstrap'
import CourseCard from '../CourseCard/CourseCard'
import useGetCoursesStudent from '../../../../hooks/useGetCoursesStudent';
import CourseSkeleton from '../../../../components/skeleton/CourseSkeleton';
// Sample data for my learning courses
const sampleCourses = [
  {
    id: 1,
    title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
    instructor: "Ed Donner, Ligency",
    level: "Beginner",
    imageUrl: null,
    progress: 12,
    completedVideos: 4,
    totalVideos: 32,
    bgColor: "#ff6b81"
  },
  {
    id: 2,
    title: "The Ultimate React Course 2025: React, Next.js, Redux & More",
    instructor: "Jonas Schmedtmann",
    level: "Intermediate",
    imageUrl: null,
    progress: 1,
    completedVideos: 1,
    totalVideos: 48,
    bgColor: "#74b9ff"
  },
  {
    id: 3,
    title: "100 Days Of Code - 2025 Web Development Bootcamp",
    instructor: "Academind by Maximilian Schwarzmüller, Maximilian...",
    level: "Beginner",
    imageUrl: null,
    progress: 3,
    completedVideos: 2,
    totalVideos: 100,
    bgColor: "#6c5ce7"
  },
  {
    id: 4,
    title: "Advanced JavaScript Concepts and Modern ES6+",
    instructor: "John Doe",
    level: "Advanced",
    imageUrl: null,
    progress: 45,
    completedVideos: 18,
    totalVideos: 40,
    bgColor: "#fd79a8"
  }
];



function AllCourses() {
  const {data: courseStudentData, isLoading: isCourseStudentLoading} = useGetCoursesStudent(1,4);
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        My Courses
      </Typography>
      <Row>
        {isCourseStudentLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Col xs={6} md={4} lg={3} className="mb-4" key={i}>
              <CourseSkeleton />
            </Col>
          ))
        ) : (
          courseStudentData?.items.map((course) => ( 
            <CourseCard course={course} key={course.id} />
          ))
        )}
      </Row>
    </Box>
  )
}

export default AllCourses