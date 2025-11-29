import { Box, Paper, Typography, Button } from '@mui/material'
import { Row, Col } from 'reactstrap'
import CourseCard from '../CourseCard/CourseCard'
import useGetCoursesStudent from '../../../../hooks/useGetCoursesStudent';
import CourseSkeleton from '../../../../components/skeleton/CourseSkeleton';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import CustomPagination from '../../../../components/pagination/CustomPagination';
import { useState } from 'react';
import { useNavigate } from "react-router-dom"

function AllCourses() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const {data: courseStudentData, isLoading: isCourseStudentLoading} = useGetCoursesStudent(pageNumber, 12);

  const handlePageChange = (event, value) => {
    setPageNumber(value);
  };
  
  if (isCourseStudentLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <LoadingSpinner />
      </div>
    );
  }
  if (!courseStudentData || courseStudentData.items.length === 0) {
    return (
      <Box sx={{ py: 4, px: 2, maxWidth: 1200, mx: 'auto' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            You haven't enrolled in any courses
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Browse our course catalog and start learning today!
          </Typography>

          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: 'brand.main',
              '&:hover': { backgroundColor: 'brand.dark' }
            }}
          >
            View Courses
          </Button>
        </Paper>
      </Box>
    )
  }
  return (
    <Box sx={{ mt: 5 }}>
      <Row>
        {isCourseStudentLoading ? (
          Array.from({ length: 24 }).map((_, i) => (
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
      {courseStudentData && courseStudentData.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <CustomPagination count={courseStudentData.totalPages} page={pageNumber} onChange={handlePageChange}/>
        </div>
      )}
    </Box>
  )
}

export default AllCourses