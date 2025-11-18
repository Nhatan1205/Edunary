import {
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack
} from '@mui/material'
import { 
  PlayCircleOutline,
  Schedule,
  Description,
  PhoneAndroid,
  AllInclusive,
  ClosedCaption,
  RecordVoiceOver,
  EmojiEvents,
} from '@mui/icons-material'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../../context/AuthContext'
import { useEnrollmentStatus } from '../../../../hooks/useEnrollmentStatus'

const CourseSidebar = ({ courseData }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isEnrolled, loading } = useEnrollmentStatus(courseData.id)

  const handleBuyNow = () => {
    navigate('/payment/checkout', {
      state: {
        courses: [{
          id: courseData.id,
          title: courseData.title,
          subtitle: courseData.subtitle,
          price: courseData.currentPrice,
          imageUrl: courseData.image,
          categoryTitle: courseData.category
        }],
        totalAmount: courseData.currentPrice
      }
    })
  }

  const handleGoToCourse = () => {
    navigate(`/course/${courseData.id}/learn`)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 380 }}>
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'sticky',
          top: 24
        }}
      >
        {/* Course Preview Image */}
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 aspect ratio
            backgroundColor: '#f7f9fa',
            overflow: 'hidden'
          }}
        >
          <Box
            component="img"
            src={courseData.imageUrl}
            alt={courseData.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />  
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Pricing */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 1
              }}
            >
              US${courseData.currentPrice}  
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 2 }}>
            {isAuthenticated && isEnrolled ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleGoToCourse}
                disabled={loading}
                sx={{
                  py: 1.5,
                  mb: 1.5,
                  fontWeight: 600,
                  backgroundColor: 'brand.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'brand.dark',
                  },
                  borderRadius: 0,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Go to Course
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mb: 1.5,
                    fontWeight: 600,
                    backgroundColor: 'brand.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'brand.dark',
                    },
                    borderRadius: 0,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? 'Checking...' : 'Buy Now'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    mb: 2,
                    borderColor: 'brand.main',
                    color: 'brand.main',
                    fontWeight: 600,
                    borderRadius: 0,
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'brand.lighter',
                      borderColor: 'brand.main',
                    }
                  }}
                >
                  Wishlist
                </Button>
              </>
            )}
          </Box>

          {/* Money Back Guarantee */}
          <Typography
            variant="body2"
            sx={{ 
              textAlign: 'center',
              color: 'text.secondary',
              mb: 2,
              fontSize: '0.75rem'
            }}
          >
            30-Day Money-Back Guarantee
          </Typography>

          {/* Course Details */}
          <Typography
            variant="subtitle1"
            sx={{ 
              fontWeight: 700,
              mb: 1.5,
              color: 'text.primary',
              fontSize: '1rem'
            }}
          >
            This course includes:
          </Typography>
          <List dense sx={{ mb: 2 }}>
            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PlayCircleOutline sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={`${courseData.duration || '32 hours'} on-demand video`}
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Schedule sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={`${courseData.quizzes || '1'} practice test`}
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Description sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={`${courseData.downloadableResources || '9'} articles`}
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PhoneAndroid sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Access on mobile and TV"
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AllInclusive sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Full lifetime access"
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ClosedCaption sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Closed captions"
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <RecordVoiceOver sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Audio description in existing audio"
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.75 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <EmojiEvents sx={{ color: 'text.secondary', fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary="Certificate of completion"
                slotProps={{
                  typography: {
                    variant: 'body2',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </ListItem>
          </List>


          <Divider sx={{ my: 2 }} />

          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: 'text.primary'
            }}
          >
            Course Information
          </Typography>
        
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.tertiary">Duration:</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {courseData.duration}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.tertiary">Language:</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {courseData.language}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.tertiary">Level:</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {courseData.level}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.tertiary">Last updated:</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {courseData.lastUpdated}
            </Typography>
          </Box>
        </Stack>

        </Box>
      </Paper>
    </Box>
  )
}

export default CourseSidebar