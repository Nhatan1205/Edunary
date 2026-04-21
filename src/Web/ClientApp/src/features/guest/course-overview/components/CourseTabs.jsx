import { useState } from 'react'
import { 
  Box,
  Tabs,
  Tab,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material'
import {
  ExpandMore,
  PlayCircleOutline,
  Assignment,
  Quiz,
  Check,
  Close as CloseIcon
} from '@mui/icons-material'
import DOMPurify from "dompurify";
import { Container } from 'reactstrap';
import { useParams } from "react-router-dom";
import RatingTab from '../../../../components/rating-tab/RatingTab';
import PreviewVideoPlayer from './PreviewVideoPlayer';

const CourseTabs = ({ courseData, reviews }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [previewVideo, setPreviewVideo] = useState(null)
  const { id } = useParams();
  const courseId = id;

  const closePreview = () => {
    setPreviewVideo(null);
  };

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
      
      {courseData.requirements && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Requirements
          </Typography>

          <Box component="ul" sx={{ pl: 3}}>
            {courseData.requirements.map((req, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                sx={{ lineHeight: 1.7, mb: 1 }}
              >
                {req}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      {courseData.description && (
        <Box sx={{ mb: 4 }}>
        <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Description
          </Typography>
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
        </Box>
      )}

      {courseData.targetAudience && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Who this course is for:
          </Typography>

          <Box component="ul" sx={{ pl: 3}}>
            {courseData.targetAudience.map((text, index) => (
              <Typography
                key={index}
                component="li"
                variant="body1"
                sx={{ lineHeight: 1.7, mb: 1 }}
              >
                {text}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )

  const renderCourses = () => {
    if (!courseData.content) return null;
    let curriculum = courseData.content?.Sections?.map((section) => ({
      title: section.Title,
      duration: section.TotalVideoDuration || undefined,
      lectures: section.Items?.length || 0,
      lessons: section.Items?.map((item) => ({
        title: item.Title,
        duration: item.VideoDuration || undefined,
        type: item.ContentType,
        isFreePreview: item.IsFreePreview,
        videoId: item.VideoId
      })) || [],
    })) || [];

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
              {courseData?.content?.TotalSection} sections
            </Typography>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2" color="text.secondary">
              {courseData?.content?.TotalLecturer} lectures
            </Typography>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2" color="text.secondary">
              {courseData?.content?.TotalVideoDuration} total
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
                     {section.title}
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
                        {lesson.type === 'article' && <Assignment sx={{ color: 'text.tertiary', fontSize: 20 }} />}
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
                        {lesson.isFreePreview && lesson.videoId && (
                          <Chip
                            label="Preview"
                            size="small"
                            color="success"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewVideo(lesson);
                            }}
                            icon={<PlayCircleOutline sx={{ fontSize: 16 }} />}
                            sx={{ mr: 1, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                          />
                        )}
                        {lesson.duration && (
                          <Typography variant="body2" color="text.secondary">
                            {lesson.duration}
                          </Typography>
                        )}
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

  const renderReviews = (courseId) => (
    <Box>
      <RatingTab courseId={courseId} />
    </Box>
  )

  return (
    <>
      <Container className="py-4 px-0 bord">
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            padding: "32px",
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              marginBottom: 3,
              fontSize: '24px',
              color: '#1c1d1f'
            }}
          >
            What you'll learn
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Array.from({ 
                length: Math.ceil(courseData?.learningObjectives.length / 2) 
              }).map((_, rowIndex) => {
                const leftItem = courseData?.learningObjectives[rowIndex];
                const rightItem = courseData?.learningObjectives[rowIndex + Math.ceil(courseData?.learningObjectives.length / 2)];
                
                return (
                  <tr key={rowIndex}>
                    <td style={{ 
                      width: '50%', 
                      padding: '6px 16px 6px 0',
                      verticalAlign: 'top'
                    }}>
                      {leftItem && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Check
                            sx={{
                              fontSize: '16px',
                              mr: 1.5,
                              mt: '2px',
                              flexShrink: 0,
                              color: '#1c1d1f'
                            }}
                          />
                          <span 
                            dangerouslySetInnerHTML={{ __html: leftItem }}
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.4',
                              color: '#1c1d1f'
                            }}
                          />
                        </Box>
                      )}
                    </td>
                    <td style={{ 
                      width: '50%', 
                      padding: '6px 0 6px 16px',
                      verticalAlign: 'top'
                    }}>
                      {rightItem && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Check
                            sx={{
                              fontSize: '16px',
                              mr: 1.5,
                              mt: '2px',
                              flexShrink: 0,
                              color: '#1c1d1f'
                            }}
                          />
                          <span 
                            dangerouslySetInnerHTML={{ __html: rightItem }}
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.4',
                              color: '#1c1d1f'
                            }}
                          />
                        </Box>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Container>
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
        {activeTab === 2 && renderReviews(courseId)}
      </Box>
    </Box>
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
          overflow: 'hidden'
        }
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
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontWeight: 600, 
              textTransform: 'uppercase', 
              letterSpacing: 1, 
              display: 'block', 
              mb: 0.5 
            }}
          >
            Course Preview
          </Typography>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              color: 'white', 
              lineHeight: 1.2 
            }}
          >
            {previewVideo?.title}
          </Typography>
        </Box>
        <IconButton 
          onClick={closePreview} 
          size="small"
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: 'black', outline: 'none' }}>
        {previewVideo?.videoId && (
          <PreviewVideoPlayer
            contentId={previewVideo.videoId}
          />
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}

export default CourseTabs