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
  Divider,
  Stack
} from '@mui/material'
import { 
  FavoriteBorder, 
  Schedule, 
  Language, 
  MenuBook, 
  VideoLibrary, 
  PlayArrow,
  Assignment,
  Quiz,
  GetApp,
  PhonelinkSetup,
  AllInclusive,
  EmojiEvents
} from '@mui/icons-material'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../../context/AuthContext'
import { useEnrollmentStatus } from '../../../../hooks/useEnrollmentStatus'
import { useAddToCart } from '../../../../hooks/useAddToCart'

const CourseSidebar = ({ courseData }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { isEnrolled, loading } = useEnrollmentStatus(courseData.id)
  const { addToCart, loading: addingToCart } = useAddToCart()

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await addToCart(courseData.id)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 380 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          position: 'sticky',
          top: 24
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
                onClick={handleAddToCart}
                startIcon={<FavoriteBorder />}
                disabled={loading || addingToCart}
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
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </>
          )}
        </Box>

        {/* Course Details */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2,
            color: 'text.primary'
          }}
        >
          This course includes:
        </Typography>
        
        <List dense>
          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <VideoLibrary sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.lectures} on-demand video lectures`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MenuBook sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.sections} sections`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
          
          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Assignment sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.assignments} assignments`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>

          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Quiz sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.quizzes} practice quizzes`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>

          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <GetApp sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary={`${courseData.downloadableResources} downloadable resources`}
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>

          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <AllInclusive sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Full lifetime access"
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>

          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PhonelinkSetup sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Access on mobile and TV"
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>

          <ListItem sx={{ px: 0, py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <EmojiEvents sx={{ color: 'text.tertiary', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Certificate of completion"
              primaryTypographyProps={{
                variant: 'body2',
                color: 'text.secondary',
                fontWeight: 500
              }}
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Course Info */}
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
      </Paper>
    </Box>
  )
}

export default CourseSidebar