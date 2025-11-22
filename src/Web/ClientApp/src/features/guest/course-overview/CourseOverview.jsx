import { Box } from '@mui/material'
import { useParams } from 'react-router'
import CourseHeader from './components/CourseHeader'
import CourseSidebar from './components/CourseSidebar'
import CourseTabs from './components/CourseTabs'
import useGetPublicCourseById from '../../../hooks/useGetPublicCourseById'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Container } from 'reactstrap'

const reviews = [
  {
    name: "Leonardo Da Vinci",
    avatar: "/api/placeholder/40/40",
    review: "Loved the course. I've learned some very subtle techniques, especially on leaves.",
  },
  {
    name: "Titania S",
    avatar: "/api/placeholder/40/40",
    review: "I loved the course, it had been a long time since I had experimented with watercolors and now I will do it more often thanks to Kitani Studio.",
  },
  {
    name: "Zhirkox",
    avatar: "/api/placeholder/40/40",
    review: "Yes I just emphasize that the use of Photoshop, for non-users, becomes difficult to follow. What requires a course to master it. Safe and very didactic teacher.",
  },
  {
    name: "Mipnaska",
    avatar: "/api/placeholder/40/40",
    review: "I haven't finished the course yet, as I would like to have some feedback from the teacher, about the comments I posted on the forum 3 months ago, and I still haven't had any answer. I think the course is well structured, however the explanations and videos are very quick for beginners. However, it is good to go practicing.",
  },
]

const CourseOverview = () => {
  const { id } = useParams()

  const { data: courseData, isLoading, isError } = useGetPublicCourseById(id)

  // Show loading
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading course details..." />
  }

  // Show redirecting if no valid course
  if (isError || !courseData?.id) {
    return <LoadingSpinner fullScreen message="Redirecting..." />
  }

  const transformedCourseData = {
    ...courseData,
    category: courseData.categoryTitle || "Course",
    instructor: courseData.targetAudience || "Instructor",
    rating: 4.8, 
    totalRatings: 156, 
    originalPrice: courseData.price * 1.3, 
    currentPrice: courseData.price,
    discount: 20,
    sections: 12,
    lectures: 45,
    language: "English",
    image: courseData.imageUrl || "https://blocks.astratic.com/img/general-img-landscape.png",
    requirements: courseData.requirements || "No prior experience required",
    learningObjectives: courseData.learningObjectives || "Master the fundamentals and build practical skills",
    welcomeMessage: courseData.welcomeMessage || "",
    topic: courseData.topic || courseData.categoryTitle || "Development",
    subtitle: courseData.subtitle || "",
    certificateOfCompletion: true,
    lifetimeAccess: true,
    mobileAccess: true,
    downloadableResources: 15,
    assignments: 8,
    quizzes: 12
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', mb: 4 }}>
      <Box sx={{ bgcolor: '#1c1d1f', color: 'white' }}>
        <Container className='pb-4 pt-5'>
          <Box sx={{ minWidth: 0, maxWidth: { md: 'calc(100% - 380px - 32px)' } }}>
            <CourseHeader courseData={transformedCourseData} />
          </Box>
        </Container>
      </Box>

      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 380px'
            },
            gap: 4,
            mt: { xs: 3, md: 0 }
          }}
        >
          <Box sx={{ minWidth: 0, py: 4 }}>
            <CourseTabs courseData={transformedCourseData} reviews={reviews} />
          </Box>
          <Box
            sx={{
              order: { xs: -1, md: 0 },
              position: { md: 'relative' },
              mt: { md: '-340px' },
            }}
          >
            <CourseSidebar courseData={transformedCourseData} />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default CourseOverview
