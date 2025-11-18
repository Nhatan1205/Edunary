import { Container, Box } from '@mui/material'
import { useParams, useNavigate } from 'react-router'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import CourseHeader from './components/CourseHeader'
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

  console.log("course",courseData);

  useEffect(() => {
    if (!isLoading && (isError || !courseData?.id)) {
      const errorMessage = isError && error?.message === "Course not found"
        ? 'Course not found. The course you are looking for does not exist or has been removed.'
        : 'Course not found or no data available.';
      
      toast.error(errorMessage);
      setTimeout(() => navigate('/'), 2000);
    }
  }, [isLoading, isError, courseData, error, navigate])

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
    duration: "8h 30m",
    language: "English",
    image: courseData.imageUrl || "https://blocks.astratic.com/img/general-img-landscape.png",
    level: courseData.level || "Beginner",
    requirements: courseData.requirements || "No prior experience required",
    learningObjectives: courseData.learningObjectives || "Master the fundamentals and build practical skills",
    welcomeMessage: courseData.welcomeMessage || "",
    topic: courseData.topic || courseData.categoryTitle || "Development",
    subtitle: courseData.subtitle || "",
    lastUpdated: "October 2024",
    certificateOfCompletion: true,
    lifetimeAccess: true,
    mobileAccess: true,
    downloadableResources: 15,
    assignments: 8,
    quizzes: 12
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Main Content - 2 Column Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              md: '1fr 380px' 
            },
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column - Main Content */}
          <Box sx={{ minWidth: 0 }}> {/* minWidth: 0 prevents grid overflow */}
            {/* Course Thumbnail */}
            {/* <CourseThumbnail image={transformedCourseData.image} title={transformedCourseData.title} /> */}
            
            {/* Course Header */}
            <CourseHeader courseData={transformedCourseData} />
            
            {/* Course Tabs */}
            <CourseTabs courseData={transformedCourseData} reviews={reviews} />
          </Box>

          {/* Right Column - Sidebar */}
          <Box 
            sx={{ 
              order: { xs: -1, md: 0 } // Show sidebar first on mobile
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
