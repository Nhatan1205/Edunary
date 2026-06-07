import { Box, Typography, Rating, Avatar, Chip, Divider, Button, IconButton } from '@mui/material'
import {
  People,
  Update,
  School,
  Mail as EmailIcon,
  Instagram as InstagramIcon,
  Language as LanguageIcon,
} from '@mui/icons-material'
import { useParams } from 'react-router'
import { Link as RouterLink } from 'react-router'
import CourseSidebar from './components/CourseSidebar'
import CourseTabs from './components/CourseTabs'
import CourseScrollHeader from './components/CourseScrollHeader'
import useGetPublicCourseById from '../../../hooks/course-hooks/useGetPublicCourseById'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { Container } from 'reactstrap'
import RelatedRoadmaps from './components/RelatedRoadmaps'
import { formatMonthYear, getLevelLabel } from '../../../utils/helpers'
import DOMPurify from 'dompurify'
import DefaultAvatar from '../../../assets/images/avatar.jpg'

const StatItem = ({ icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  </Box>
)

const InstructorProfileSection = ({ owner }) => {
  if (!owner) return null

  return (
    <Box sx={{ mt: 5 }}>
      <Divider sx={{ mb: 4, borderColor: 'divider' }} />

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}
      >
        Instructor
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Box
          component="img"
          src={owner.avatar || DefaultAvatar}
          alt={owner.name}
          sx={{
            width: 120,
            height: 120,
            borderRadius: 1.5,
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 0.5,
              fontSize: '1.5rem',
            }}
          >
            {owner.name}
          </Typography>

          {owner.headline && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 500, mb: 1, display: 'block' }}
            >
              {owner.headline}
            </Typography>
          )}

          <Box
            sx={{
              bgcolor: '#008b6a', // bolder brand green
              color: 'white',
              px: 1.25,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              lineHeight: 1,
              display: 'inline-block',
              mb: 1.5,
            }}
          >
            INSTRUCTOR
          </Box>
        </Box>
      </Box>

      {owner.description && (
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ lineHeight: 1.8, color: 'text.primary', mt: 2 }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(owner.description),
          }}
        />
      )}
    </Box>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────── */
const CourseOverview = () => {
  const { id } = useParams()
  const { data: courseData, isLoading, isError } = useGetPublicCourseById(id)

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading course details..." />
  }

  if (isError || !courseData?.id) {
    return <LoadingSpinner fullScreen message="Redirecting..." />
  }

  // Hook already parses: content, learningObjectives, requirements, targetAudience
  const course = {
    ...courseData,
    categoryTitle: courseData.categoryTitle || 'Course',
    price: courseData.price ?? 0,
    imageUrl: courseData.imageUrl || 'https://blocks.astratic.com/img/general-img-landscape.png',
  }

  const owner = course.instructors?.[0]
  const hasRatings = course.ratings > 0

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Scroll-triggered fixed header */}
      <CourseScrollHeader courseData={course} triggerOffset={250} />

      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
            gap: { xs: 3, md: 5 },
            alignItems: 'start',
            pt: { xs: 3, md: 5 },
            pb: 6,
          }}
        >
          {/* ── Left Column: Title, Stats, and Tabs ── */}
          <Box sx={{ minWidth: 0 }}>
            {/* Title */}
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                lineHeight: 1.2,
                color: 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {course.title}
            </Typography>

            {/* Subtitle */}
            {course.subtitle && (
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: 'text.secondary',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  maxWidth: 700,
                }}
              >
                {course.subtitle}
              </Typography>
            )}

            {/* A course by [name] */}
            {owner && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                <Avatar
                  src={owner.avatar}
                  alt={owner.name}
                  sx={{ width: 28, height: 28, border: '1.5px solid', borderColor: 'brand.light' }}
                />
                <Typography variant="body2" color="text.secondary">
                  A course by{' '}
                  <Typography
                    component={RouterLink}
                    to={`/profile/${owner.id}`}
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: 'brand.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {owner.name}
                  </Typography>
                  {owner.headline && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {', '}{owner.headline}
                    </Typography>
                  )}
                </Typography>
              </Box>
            )}

            {/* Stats Box */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 1.5, sm: 2.5 },
                p: 2,
                bgcolor: 'background.alt',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                mb: 3,
              }}
            >
              {/* Rating */}
              {hasRatings && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    {course.ratings?.toFixed(1)}
                  </Typography>
                  <Rating
                    value={course.ratings || 0}
                    precision={0.5}
                    size="small"
                    readOnly
                    sx={{
                      '& .MuiRating-iconFilled': { color: '#FAAF00' },
                      '& .MuiRating-iconEmpty': { color: '#D0D0D0' },
                    }}
                  />
                  {course.totalRatings > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      ({course.totalRatings?.toLocaleString()} reviews)
                    </Typography>
                  )}
                </Box>
              )}

              {/* Separator */}
              {hasRatings && <Box sx={{ width: 1, height: 16, bgcolor: 'divider' }} />}

              {/* Students */}
              <StatItem icon={<People sx={{ fontSize: 16 }} />}>
                {course.totalStudents?.toLocaleString()} students
              </StatItem>

              {/* Level */}
              <StatItem icon={<School sx={{ fontSize: 16 }} />}>
                {getLevelLabel(course.level)}
              </StatItem>

              {/* Updated */}
              <StatItem icon={<Update sx={{ fontSize: 16 }} />}>
                Updated {formatMonthYear(course.lastModified)}
              </StatItem>
            </Box>

            {/* On mobile: render Sidebar between Stats and Tabs */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
              <CourseSidebar courseData={course} />
            </Box>

            {/* Related topics (before Tabs, after Stats Box) */}
            {course.topics?.length > 0 && (
              <Container className="py-0 px-0">
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    padding: '24px 32px',
                    backgroundColor: 'background.paper',
                    mt: 0,
                    mb: 4,
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}
                  >
                    Related topics
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {course.topics.map((topic) => (
                      <Chip
                        key={topic.id}
                        label={topic.name}
                        variant="outlined"
                        sx={{
                          borderColor: 'text.secondary',
                          color: 'text.primary',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          borderRadius: '10px',
                          '&:hover': {
                            bgcolor: 'grey.200',
                          },
                          cursor: 'default',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Container>
            )}

            {/* Tabs component */}
            <CourseTabs courseData={course} />

            {/* Instructor Profile (always visible on scroll down under tabs) */}
            {owner && <InstructorProfileSection owner={owner} />}
          </Box>

          {/* ── Right Column: Sidebar (Desktop only) ── */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'relative',
              height: '100%',
            }}
          >
            <CourseSidebar courseData={course} />
          </Box>
        </Box>
      </Container>

      {/* ── Related Roadmaps ─────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.alt' }}>
        <Container>
          <RelatedRoadmaps courseId={id} />
        </Container>
      </Box>
    </Box>
  )
}

export default CourseOverview
