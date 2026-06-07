import { useState, useMemo } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Avatar,
  Button,
  Divider,
  Paper,
} from '@mui/material'
import {
  PlayCircleOutline,
  Assignment,
  Check,
  Close as CloseIcon,
  OpenInNew,
  ExpandMore,
  ExpandLess,
  Article,
  EmojiEvents,
  Description,
  PlayCircle,
  OndemandVideo,
} from '@mui/icons-material'
import DOMPurify from 'dompurify'
import { useParams } from 'react-router-dom'
import { Link as RouterLink } from 'react-router'
import RatingTab from '../../../../components/rating-tab/RatingTab'
import PreviewVideoPlayer from './PreviewVideoPlayer'

const LessonIcon = ({ type }) => {
  const iconStyle = { color: 'text.secondary', fontSize: 20 }
  if (type === 'video') return <PlayCircleOutline sx={iconStyle} />
  if (type === 'article') return <Article sx={iconStyle} />
  return <Assignment sx={iconStyle} />
}

/* ─────────────────────────────────────────────────────────
   Tab 1 – Description
   ───────────────────────────────────────────────────────── */
const DescriptionTab = ({ courseData }) => (
  <Box sx={{ py: 3 }}>
    {/* What you'll learn */}
    {courseData.learningObjectives?.length > 0 && (
      <Box
        sx={{
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
        >
          What you'll learn
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          {courseData.learningObjectives.map((obj, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Check
                sx={{
                  fontSize: 16,
                  color: 'brand.main',
                  mt: '4px',
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body1"
                sx={{ lineHeight: 1.6, color: 'text.primary' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(obj) }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    )}

    {/* Requirements */}
    {courseData.requirements?.length > 0 && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Requirements
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {courseData.requirements.map((req, i) => (
            <Typography
              key={i}
              component="li"
              variant="body1"
              sx={{ lineHeight: 1.7, mb: 0.75, color: 'text.primary' }}
            >
              {req}
            </Typography>
          ))}
        </Box>
      </Box>
    )}

    {/* Description */}
    {courseData.description && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Description
        </Typography>
        <Typography
          variant="body1"
          sx={{ lineHeight: 1.8, color: 'text.primary' }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(courseData.description),
          }}
        />
      </Box>
    )}

    {/* Who this course is for */}
    {courseData.targetAudience?.length > 0 && (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
          Who this course is for
        </Typography>
        <Box component="ul" sx={{ pl: 2, m: 0 }}>
          {courseData.targetAudience.map((item, i) => (
            <Typography
              key={i}
              component="li"
              variant="body1"
              sx={{ lineHeight: 1.7, mb: 0.75, color: 'text.primary' }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>
    )}
  </Box>
)

/* ─────────────────────────────────────────────────────────
   Tab 2 – Content
   ───────────────────────────────────────────────────────── */
const ContentTab = ({ courseData, onPreviewClick, isEnrolled }) => {
  if (!courseData.content) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No content available.</Typography>
      </Box>
    )
  }

  const curriculum = courseData.content?.Sections?.map(section => ({
    title: section.Title,
    lessons: section.Items?.map(item => ({
      title: item.Title,
      duration: item.VideoDuration,
      type: item.ContentType,
      isFreePreview: item.IsFreePreview,
      videoId: item.VideoId,
    })) || [],
  })) || []

  // Compute summary stats
  const totalLectures = courseData.content?.TotalLecturer || 0
  const totalDuration = courseData.content?.TotalVideoDuration || ''
  const totalSections = courseData.content?.TotalSection || 0

  const totalExercises = courseData.content?.Sections?.reduce(
    (sum, section) =>
      sum +
      section.Items.filter(
        item => item.ContentType === 'quiz' || item.ContentType === 'assignment'
      ).length,
    0
  ) || 0

  const totalArticles = courseData.content?.Sections?.reduce(
    (sum, section) =>
      sum + section.Items.filter(item => item.ContentType === 'article').length,
    0
  ) || 0

  return (
    <Box sx={{ py: 3 }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}
      >
        Course summary
      </Typography>
      {/* 2x2 Summary Grid */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          mb: 4,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          rowGap: 2.5,
          columnGap: 4,
          p: 3,
        }}
      >
        {/* Cell 1: Lessons & Duration */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <OndemandVideo sx={{ fontSize: 24, color: 'text.secondary' }} />
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {totalLectures} lessons
            </Typography>
            {totalDuration && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                ({totalDuration})
              </Typography>
            )}
          </Box>
        </Box>

        {/* Cell 2: Articles */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Description sx={{ fontSize: 24, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {totalArticles} articles
            </Typography>
          </Box>
        </Box>

        {/* Cell 3: Exercises */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment sx={{ fontSize: 24, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              {totalExercises} exercises
            </Typography>
          </Box>
        </Box>

        {/* Cell 4: Certificate */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEvents sx={{ fontSize: 24, color: 'text.secondary' }} />
          <Box>
            <Typography variant="body1" fontWeight={600} color="text.primary">
              Certificate of completion
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Curriculum list */}
      <Box>
        {curriculum.map((section, sIdx) => (
          <Box key={sIdx}>
            {/* Section header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: sIdx > 0 ? 3 : 1,
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '1.1rem',
                }}
              >
                {`Section ${sIdx + 1}: ${section.title}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, ml: 1 }}>
                {section.lessons.length} {section.lessons.length === 1 ? 'lesson' : 'lessons'}
              </Typography>
            </Box>

            {/* Lessons list */}
            <Box>
              {section.lessons.map((lesson, lIdx) => (
                <Box
                  key={lIdx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 2,
                    px: 0,
                    borderRadius: 1,
                    transition: 'background 0.15s',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                  }}
                >
                  {/* Type icon */}
                  <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <LessonIcon type={lesson.type} />
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="body1"
                    sx={{
                      flexGrow: 1,
                      color: 'text.primary',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {lesson.title}
                  </Typography>

                  {/* Right side: preview link + duration */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    {lesson.isFreePreview && lesson.videoId && (
                      <Box
                        onClick={() => onPreviewClick(lesson)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          cursor: 'pointer',
                          color: 'brand.main',
                          textDecoration: 'underline',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          userSelect: 'none',
                        }}
                      >
                        <PlayCircle sx={{ fontSize: 18, color: 'brand.main' }} />
                        <span>Preview</span>
                      </Box>
                    )}
                    {lesson.type === 'video' && lesson.duration && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ minWidth: 40, textAlign: 'right' }}
                      >
                        {lesson.duration}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Section Divider */}
            {sIdx < curriculum.length - 1 && (
              <Divider sx={{ my: 3.5, borderColor: 'divider' }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

/** Small stat chip in content tab header */
const SummaryChip = ({ icon, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Box sx={{ color: 'brand.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography variant="body2" fontWeight={600} color="text.primary">
      {label}
    </Typography>
  </Box>
)

/* ─────────────────────────────────────────────────────────
   Tab 4 – Teachers
───────────────────────────────────────────────────────── */
const TeachersTab = ({ instructors }) => (
  <Box sx={{ py: 3 }}>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
      Meet your instructors
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {instructors.map((instructor, idx) => (
        <InstructorCard key={instructor.id || idx} instructor={instructor} isFirst={idx === 0} />
      ))}
    </Box>
  </Box>
)

const InstructorCard = ({ instructor, isFirst }) => {
  const [expanded, setExpanded] = useState(false)
  const hasLongBio = instructor.description && instructor.description.length > 280

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 3,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Header: avatar + name + headline */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
        <Avatar
          src={instructor.avatar}
          alt={instructor.name}
          sx={{
            width: 72,
            height: 72,
            border: '2px solid',
            borderColor: 'brand.lighter',
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography
              component={RouterLink}
              to={`/profile/${instructor.id}`}
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'brand.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {instructor.name}
            </Typography>
            {isFirst && (
              <Chip
                label="Course Owner"
                size="small"
                sx={{
                  bgcolor: 'brand.lighter',
                  color: 'brand.darker',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            )}
          </Box>
          {instructor.headline && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.5, fontStyle: 'italic' }}
            >
              {instructor.headline}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Bio */}
      {instructor.description ? (
        <Box>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              lineHeight: 1.75,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 4,
              WebkitBoxOrient: 'vertical',
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(instructor.description),
            }}
          />
          {hasLongBio && (
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{
                mt: 1,
                color: 'brand.main',
                textTransform: 'none',
                fontWeight: 600,
                p: 0,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              {expanded ? 'Show less' : 'Show more'}
            </Button>
          )}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No bio provided.
        </Typography>
      )}

      {/* View profile link */}
      <Box sx={{ mt: 2 }}>
        <Button
          component={RouterLink}
          to={`/profile/${instructor.id}`}
          size="small"
          variant="outlined"
          endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
          sx={{
            borderColor: 'brand.main',
            color: 'brand.main',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            '&:hover': { bgcolor: 'brand.lighter', borderColor: 'brand.main' },
          }}
        >
          View Profile
        </Button>
      </Box>
    </Paper>
  )
}

/* ─────────────────────────────────────────────────────────
   Main CourseTabs component
───────────────────────────────────────────────────────── */
const CourseTabs = ({ courseData }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [previewVideo, setPreviewVideo] = useState(null)
  const { id } = useParams()
  const courseId = id

  // Teachers tab: only shown if course has collaborators (instructors.length > 1)
  const hasTeachersTab = courseData?.instructors?.length > 1

  const tabs = useMemo(() => {
    const base = [
      { label: 'Information' },
      { label: 'Content' },
      { label: 'Reviews' },
    ]
    if (hasTeachersTab) {
      base.push({ label: 'Teachers' })
    }
    return base
  }, [hasTeachersTab])

  const handleTabChange = (_, newValue) => setActiveTab(newValue)

  const closePreview = () => setPreviewVideo(null)

  return (
    <>
      <Box
        sx={{
          bgcolor: 'transparent',
          borderRadius: 0,
          border: 'none',
          overflow: 'visible',
        }}
      >
        {/* Tab bar */}
        <Box sx={{ px: 0, pt: 1.5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.975rem',
                color: 'text.secondary',
                px: { xs: 2, sm: 3 },
                py: 1.75,
                minHeight: 48,
                '&.Mui-selected': {
                  color: 'brand.main',
                  fontWeight: 700,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'brand.main',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {tabs.map((tab, idx) => (
              <Tab key={idx} label={tab.label} id={`course-tab-${idx}`} />
            ))}
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ px: 0, pb: 3 }}>
          {activeTab === 0 && <DescriptionTab courseData={courseData} />}
          {activeTab === 1 && (
            <ContentTab
              courseData={courseData}
              onPreviewClick={setPreviewVideo}
              isEnrolled={courseData.isEnrolled}
            />
          )}
          {activeTab === 2 && (
            <Box sx={{ py: 2 }}>
              <RatingTab courseId={courseId} />
            </Box>
          )}
          {hasTeachersTab && activeTab === 3 && (
            <TeachersTab instructors={courseData.instructors} />
          )}
        </Box>
      </Box>

      {/* Preview video dialog */}
      <Dialog
        open={Boolean(previewVideo)}
        onClose={closePreview}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            px: 3,
            bgcolor: 'brand.main',
            color: 'white',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.75)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                display: 'block',
                mb: 0.5,
              }}
            >
              Course Preview
            </Typography>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
              {previewVideo?.title}
            </Typography>
          </Box>
          <IconButton
            onClick={closePreview}
            size="small"
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'black', outline: 'none' }}>
          {previewVideo?.videoId && (
            <PreviewVideoPlayer contentId={previewVideo.videoId} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CourseTabs