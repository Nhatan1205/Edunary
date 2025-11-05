import { useState } from 'react'
import { 
  Box, 
  Tabs, 
  Tab, 
  Divider, 
  Typography, 
  Avatar, 
  Button, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material'
import { 
  ExpandMore, 
  PlayCircleOutline, 
  Assignment, 
  Quiz,
  Schedule
} from '@mui/icons-material'
import DOMPurify from "dompurify";

const CourseTabs = ({ courseData, reviews }) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderDescription = () => (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'text.primary'
        }}
      >
        About This Course
      </Typography>
      
      {courseData.description && (
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.7,
            fontSize: "1.1rem",
            mb: 4,
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(courseData.description),
          }}
        />
      )}


      {courseData.welcomeMessage && (
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: 'text.primary'
            }}
          >
            Welcome Message
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.7, 
              color: 'text.secondary',
              fontStyle: 'italic',
              p: 2,
              bgcolor: 'background.alt',
              borderRadius: 1,
              borderLeft: '4px solid',
              borderColor: 'brand.main'
            }}
          >
            {courseData.welcomeMessage}
          </Typography>
        </Box>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: 'text.primary'
          }}
        >
          What You'll Learn
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.7, 
            color: 'text.secondary'
          }}
        >
          {courseData.learningObjectives}
        </Typography>
      </Box>

      {courseData.requirements && (
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: 'text.primary'
            }}
          >
            Requirements
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.7, 
              color: 'text.secondary'
            }}
          >
            {courseData.requirements}
          </Typography>
        </Box>
      )}

      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: 'text.primary'
          }}
        >
          Who This Course Is For
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            lineHeight: 1.7, 
            color: 'text.secondary'
          }}
        >
          This course is perfect for beginners who want to learn {courseData.topic.toLowerCase()} from scratch, 
          as well as intermediate learners looking to strengthen their foundation and learn best practices.
        </Typography>
      </Box>
    </Box>
  )

  const renderCourses = () => {
    // Mock curriculum data - in real app this would come from courseData
    const curriculum = [
      {
        title: "Getting Started",
        duration: "45 min",
        lectures: 6,
        lessons: [
          { title: "Course Introduction", duration: "5 min", type: "video" },
          { title: "Setting Up Your Development Environment", duration: "12 min", type: "video" },
          { title: "Understanding the Basics", duration: "18 min", type: "video" },
          { title: "Your First Project", duration: "8 min", type: "video" },
          { title: "Knowledge Check", duration: "2 min", type: "quiz" }
        ]
      },
      {
        title: "Core Concepts",
        duration: "2h 15m",
        lectures: 12,
        lessons: [
          { title: "Introduction to Core Principles", duration: "15 min", type: "video" },
          { title: "Working with Data", duration: "25 min", type: "video" },
          { title: "Building Your First Feature", duration: "30 min", type: "video" },
          { title: "Practice Exercise 1", duration: "45 min", type: "assignment" },
          { title: "Advanced Techniques", duration: "20 min", type: "video" },
          { title: "Section Quiz", duration: "5 min", type: "quiz" }
        ]
      },
      {
        title: "Advanced Topics",
        duration: "3h 20m",
        lectures: 15,
        lessons: [
          { title: "Advanced Concepts Overview", duration: "10 min", type: "video" },
          { title: "Performance Optimization", duration: "35 min", type: "video" },
          { title: "Best Practices", duration: "25 min", type: "video" },
          { title: "Real-world Project", duration: "90 min", type: "assignment" },
          { title: "Final Assessment", duration: "40 min", type: "quiz" }
        ]
      }
    ];

    return (
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary'
            }}
          >
            Course Content
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {courseData.sections} sections
            </Typography>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2" color="text.secondary">
              {courseData.lectures} lectures
            </Typography>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2" color="text.secondary">
              {courseData.duration} total
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          {curriculum.map((section, sectionIndex) => (
            <Accordion 
              key={sectionIndex}
              sx={{
                mb: 1,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-expanded': {
                  margin: '0 0 8px 0',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: 'text.tertiary' }} />}
                sx={{
                  bgcolor: 'background.alt',
                  '&.Mui-expanded': {
                    minHeight: 48,
                  },
                  '& .MuiAccordionSummary-content': {
                    margin: '12px 0',
                    '&.Mui-expanded': {
                      margin: '12px 0',
                    },
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mr: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    Section {sectionIndex + 1}: {section.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Chip 
                      label={`${section.lectures} lectures`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        borderColor: 'text.disabled',
                        color: 'text.secondary',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {section.duration}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <List dense>
                  {section.lessons.map((lesson, lessonIndex) => (
                    <ListItem 
                      key={lessonIndex}
                      sx={{ 
                        px: 0, 
                        py: 1,
                        borderBottom: lessonIndex < section.lessons.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {lesson.type === 'video' && <PlayCircleOutline sx={{ color: 'brand.main', fontSize: 20 }} />}
                        {lesson.type === 'assignment' && <Assignment sx={{ color: 'text.tertiary', fontSize: 20 }} />}
                        {lesson.type === 'quiz' && <Quiz sx={{ color: 'text.tertiary', fontSize: 20 }} />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={lesson.title}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                          fontWeight: 500
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled">
                          {lesson.duration}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    );
  }

  const renderReviews = () => (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 4,
          color: 'text.primary'
        }}
      >
        Reviews
      </Typography>
      <Box sx={{ mb: 4 }}>
        {reviews.map((review, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              <Avatar 
                src={review.avatar} 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: 'brand.main',
                  color: 'text.inverse',
                  fontWeight: 600
                }}
              >
                {review.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: 'text.primary'
                  }}
                >
                  {review.name}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.7,
                    fontSize: '1rem'
                  }}
                >
                  {review.review}
                </Typography>
              </Box>
            </Box>
            {index < reviews.length - 1 && (
              <Divider 
                sx={{ 
                  mt: 3,
                  borderColor: 'divider'
                }} 
              />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="outlined"
          sx={{
            borderColor: 'brand.main',
            color: 'brand.main',
            fontWeight: 500,
            px: 3,
            py: 1.5,
            borderRadius: 1.5,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'brand.lighter',
              borderColor: 'brand.main',
            }
          }}
        >
          Load more reviews
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ px: 3, pt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              color: 'text.tertiary',
              px: 3,
              py: 2,
              '&.Mui-selected': {
                color: 'brand.main',
                fontWeight: 600,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'brand.main',
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tab label="Description" />
          <Tab label="Content" />
          <Tab label="Reviews" />
        </Tabs>
      </Box>

      <Box sx={{ px: 3, pb: 3 }}>
        {activeTab === 0 && renderDescription()}
        {activeTab === 1 && renderCourses()}
        {activeTab === 2 && renderReviews()}
      </Box>
    </Box>
  )
}

export default CourseTabs