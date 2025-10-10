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
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {/* Pricing */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary'
              }}
            >
              US${courseData.currentPrice}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                textDecoration: 'line-through', 
                color: 'text.tertiary' 
              }}
            >
              ${courseData.originalPrice}
            </Typography>
          </Box>
          <Chip
            label={`${courseData.discount}% OFF`}
            sx={{
              backgroundColor: 'brand.main',
              color: 'text.inverse',
              fontWeight: 600,
              mb: 2,
              px: 1,
              '& .MuiChip-label': {
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mb: 4 }}>
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
                fontWeight: 600,
                backgroundColor: 'brand.main',
                color: 'text.inverse',
                '&:hover': {
                  backgroundColor: 'brand.dark',
                },
                borderRadius: 1.5,
                textTransform: 'none'
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
                  fontWeight: 600,
                  backgroundColor: 'brand.main',
                  color: 'text.inverse',
                  '&:hover': {
                    backgroundColor: 'brand.dark',
                  },
                  borderRadius: 1.5,
                  textTransform: 'none'
                }}
              >
                {loading ? 'Checking...' : 'Buy Now'}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FavoriteBorder />}
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderColor: 'brand.main',
                  color: 'brand.main',
                  fontWeight: 500,
                  borderRadius: 1.5,
                  textTransform: 'none',
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

        {/* Course Details */}
        <List dense>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MenuBook sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.sections} Section`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <VideoLibrary sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.lectures} Lectures`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Schedule sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.duration} total length`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Language sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={courseData.language}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}

export default CourseSidebar