import { Container, Box } from '@mui/material'
import CourseHeader from './components/CourseHeader'
import CourseThumbnail from './components/CourseThumbnail'
import CourseSidebar from './components/CourseSidebar'
import CourseTabs from './components/CourseTabs'

const courseData = {
  category: "Development / Mobile Engineer",
  title: "Make Uber Clone App",
  instructor: "Steven Arnatovic",
  rating: 4.8,
  totalRatings: 1812,
  originalPrice: 30.13,
  currentPrice: 22.4,
  discount: 20,
  sections: 22,
  lectures: 152,
  duration: "21h 33m",
  language: "English",
  description: `Vue (pronounced /vjuː/, like view) is a progressive framework for building user interfaces. Unlike other monolithic frameworks, Vue is designed from the ground up to be incrementally adoptable. The core library is focused on the view layer only, and is easy to pick up and integrate with other libraries or existing projects. On the other hand, Vue is also perfectly capable of powering sophisticated Single-Page Applications when used in combination with modern tooling and supporting libraries.`,
  image: "https://dianapps.com/blog/wp-content/uploads/2025/04/Uber-Clone-App-Development.png",
}

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
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Course Header */}
      <CourseHeader courseData={courseData} />

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: 4, mb: 1 }}>
        {/* Left Content */}
        <Box sx={{ flex: 1 }}>
          <CourseThumbnail image={courseData.image} title={courseData.title} />
        </Box>

        {/* Right Sidebar */}
        <CourseSidebar courseData={courseData} />
      </Box>

      {/* Tabs Section */}
      <CourseTabs courseData={courseData} reviews={reviews} />
    </Container>
  )
}

export default CourseOverview
