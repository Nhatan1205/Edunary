import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { FavoriteBorder, Schedule, Language, MenuBook, VideoLibrary, PlayArrow } from '@mui/icons-material'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../../context/AuthContext'
import { useEnrollmentStatus } from '../../../../hooks/useEnrollmentStatus'

const CourseSidebar = ({ courseData }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isEnrolled, loading } = useEnrollmentStatus(courseData.id)

  const handleBuyNow = () => {
    // Navigate to checkout with course data
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
    <Box sx={{ width: 320 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Pricing */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              US${courseData.currentPrice}
            </Typography>
            <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              ${courseData.originalPrice}
            </Typography>
          </Box>
          <Chip
            label={`${courseData.discount}% OFF`}
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 3 }}>
          {isAuthenticated && isEnrolled ? (
            // User is enrolled - show "Go to Course" button
            <Button
              variant="contained"
              fullWidth
              onClick={handleGoToCourse}
              startIcon={<PlayArrow />}
              sx={{
                py: 1.5,
                mb: 2,
                fontWeight: 'bold',
                backgroundColor: '#22c55e',
                '&:hover': {
                  backgroundColor: '#16a34a',
                },
              }}
            >
              Go to Course
            </Button>
          ) : (
            // User is not enrolled or not authenticated - show buy/wishlist buttons
            <>
              <Button
                variant="contained"
                fullWidth
                onClick={handleBuyNow}
                disabled={loading}
                sx={{
                  py: 1.5,
                  mb: 2,
                  fontWeight: 'bold',
                }}
              >
                {loading ? 'Checking...' : 'Buy Now'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FavoriteBorder />}
                color="primary"
                disabled={loading}
              >
                Wishlist
              </Button>
            </>
          )}
        </Box>

        {/* Course Details */}
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MenuBook sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={`${courseData.sections} Section`} />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <VideoLibrary sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={`${courseData.lectures} Lectures`} />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Schedule sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={`${courseData.duration} total length`} />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Language sx={{ color: 'text.secondary' }} />
            </ListItemIcon>
            <ListItemText primary={courseData.language} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}

export default CourseSidebar