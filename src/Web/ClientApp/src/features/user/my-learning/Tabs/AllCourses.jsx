import { Box } from '@mui/material'
import { Row, Col } from 'reactstrap'
import CourseCard from '../CourseCard/CourseCard'
import useGetCoursesStudent from '../../../../hooks/useGetCoursesStudent';
import CourseSkeleton from '../../../../components/skeleton/CourseSkeleton';

function AllCourses() {
  const {data: courseStudentData, isLoading: isCourseStudentLoading} = useGetCoursesStudent(1,4);
  return (
    <Box sx={{ mt: 5 }}>
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