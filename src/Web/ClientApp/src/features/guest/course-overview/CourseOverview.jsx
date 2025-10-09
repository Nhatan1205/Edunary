import { Container, Box } from '@mui/material'
import { useParams, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import CourseHeader from './components/CourseHeader'
import CourseThumbnail from './components/CourseThumbnail'
import CourseSidebar from './components/CourseSidebar'
import CourseTabs from './components/CourseTabs'
import useGetPublicCourseById from '../../../hooks/useGetPublicCourseById'
import LoadingSpinner from '../../../components/LoadingSpinner'

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
  const navigate = useNavigate()
  const { data: courseData, isLoading, isError, error } = useGetPublicCourseById(id)

  useEffect(() => {
    if (isError) {
      const errorMessage = error?.message === "Course not found" 
        ? 'Course not found. The course you are looking for does not exist or has been removed.'
        : 'Failed to load course. Please try again later.';
      
      toast.error(errorMessage);
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }
  }, [isError, error, navigate])

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading course details..." />
  }

  if (isError || !courseData) {
    return <LoadingSpinner fullScreen message="Redirecting..." />
  }

  const transformedCourseData = {
    ...courseData,
    category: courseData.categoryTitle || "Course",
    instructor: "Instructor",
    rating: 4.8, 
    totalRatings: 0, 
    originalPrice: courseData.price * 1.3, 
    currentPrice: courseData.price,
    discount: 20,
    sections: 0,
    lectures: 0, 
    duration: "0h 0m",
    language: "English",
    image: courseData.imageUrl || "https://blocks.astratic.com/img/general-img-landscape.png",
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Course Header */}
      <CourseHeader courseData={transformedCourseData} />

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          mb: 1,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
        }}
      >
        {/* Left Content */}
        <Box
          sx={{
            flex: 1,
            width: { xs: '100%', sm: '400px', md: '100%' },
            maxWidth: { xs: 350, sm: 400, md: 'none' },
          }}
        >
          <CourseThumbnail image={transformedCourseData.image} title={transformedCourseData.title} />
        </Box>

        {/* Right Sidebar */}
        <CourseSidebar courseData={transformedCourseData} />
      </Box>

      {/* Tabs Section */}
      <CourseTabs courseData={transformedCourseData} reviews={reviews} />
    </Container>
  )
}

export default CourseOverview
