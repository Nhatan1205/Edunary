import { useState, useEffect } from 'react'
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
  Stack,
  Chip,
} from '@mui/material'
import {
  PlayCircleOutline,
  Description,
  PhoneAndroid,
  ShoppingCart,
  AllInclusive,
  EmojiEvents,
  PlayArrow,
  UpdateOutlined,
  SchoolOutlined,
  CategoryOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../../context/AuthContext'
import { formatMonthYear, getLevelLabel } from '../../../../utils/helpers'
import { useAddToCart } from '../../../../hooks/cart-hooks/useAddToCart'
import DefaultImage from '../../../../assets/images/default.jpg'

const CourseSidebar = ({ courseData }) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const isEnrolled = courseData?.isEnrolled ?? false
  const { addToCart, loading: addingToCart } = useAddToCart()
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleBuyNow = () => {
    navigate('/payment/checkout', {
      state: {
        courses: [{
          id: courseData.id,
          title: courseData.title,
          subtitle: courseData.subtitle,
          price: courseData.price,
          imageUrl: courseData.imageUrl,
          categoryTitle: courseData.categoryTitle,
        }],
        totalAmount: courseData.price,
      },
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

  const totalArticles = courseData.content?.Sections?.reduce(
    (sum, section) =>
      sum + section.Items.filter(item => item.ContentType === 'article').length,
    0
  ) || 0

  const totalVideos = courseData.content?.Sections?.reduce(
    (sum, section) =>
      sum + section.Items.filter(item => item.ContentType === 'video').length,
    0
  ) || 0

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 380,
        position: 'sticky',
        top: { xs: 0, md: isSticky ? 24 : 0 },
        mt: 0,
        transition: 'all 0.3s ease',
        zIndex: isSticky ? 1200 : 1,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: isSticky ? '1px solid' : 'none',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: isSticky ? '0 8px 32px rgba(0,0,0,0.12)' : 'none',
          bgcolor: isSticky ? 'background.paper' : 'transparent',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Course image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: isSticky ? 0 : 'auto',
            maxHeight: isSticky ? 0 : 250,
            paddingTop: isSticky ? 0 : '56.25%',
            backgroundColor: 'grey.100',
            overflow: 'hidden',
            opacity: isSticky ? 0 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          <Box
            component="img"
            src={courseData.imageUrl || DefaultImage}
            alt={courseData.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          />
        </Box>

        <Box sx={{ p: isSticky ? 2.5 : 3, transition: 'padding 0.3s ease' }}>
          {/* Price */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.5px',
              }}
            >
              {courseData.price === 0 ? 'Free' : `$${courseData.price?.toFixed(2)}`}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 1.5 }}>
            {isAuthenticated && isEnrolled ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleGoToCourse}
                startIcon={<PlayArrow />}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  bgcolor: 'brand.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'brand.dark' },
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Go to Course
              </Button>
            ) : (
              <Stack spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBuyNow}
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    bgcolor: 'brand.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'brand.dark' },
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                  }}
                >
                  Buy Now
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleAddToCart}
                  startIcon={<ShoppingCart />}
                  disabled={addingToCart}
                  sx={{
                    py: 1.25,
                    borderColor: 'brand.main',
                    color: 'brand.main',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(0, 178, 137, 0.08)',
                      borderColor: 'brand.main',
                    },
                  }}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
              </Stack>
            )}
          </Box>

          {/* Money back */}
          {/* <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 2.5,
              fontSize: '0.78rem',
            }}
          >
            30-Day Money-Back Guarantee
          </Typography> */}

          <Divider sx={{ mb: 2.5 }} />

          {/* This course includes */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: 'text.primary',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            This course includes
          </Typography>

          <List dense disablePadding sx={{ mb: 2 }}>
            {courseData.content?.TotalVideoDuration && (
              <SidebarItem
                icon={<AccessTimeOutlined sx={{ fontSize: 17, color: 'brand.main' }} />}
                text={`${courseData.content.TotalVideoDuration} on-demand video`}
              />
            )}
            {courseData.content?.TotalLecturer > 0 && (
              <SidebarItem
                icon={<PlayCircleOutline sx={{ fontSize: 17, color: 'brand.main' }} />}
                text={`${totalVideos} video lecture${totalVideos !== 1 ? 's' : ''}`}
              />
            )}
            {totalArticles > 0 && (
              <SidebarItem
                icon={<Description sx={{ fontSize: 17, color: 'brand.main' }} />}
                text={`${totalArticles} article${totalArticles !== 1 ? 's' : ''}`}
              />
            )}
            <SidebarItem
              icon={<PhoneAndroid sx={{ fontSize: 17, color: 'brand.main' }} />}
              text="Access on mobile and TV"
            />
            <SidebarItem
              icon={<AllInclusive sx={{ fontSize: 17, color: 'brand.main' }} />}
              text="Full lifetime access"
            />
            <SidebarItem
              icon={<EmojiEvents sx={{ fontSize: 17, color: 'brand.main' }} />}
              text="Certificate of completion"
            />
          </List>

          <Divider sx={{ mb: 2.5 }} />

          {/* Course info */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: 'text.primary',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Course Info
          </Typography>

          <Stack spacing={1.25}>
            {courseData.categoryTitle && (
              <InfoRow
                icon={<CategoryOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />}
                label="Category"
                value={courseData.categoryTitle}
              />
            )}
            <InfoRow
              icon={<SchoolOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />}
              label="Level"
              value={getLevelLabel(courseData.level)}
            />
            <InfoRow
              icon={<UpdateOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />}
              label="Last updated"
              value={formatMonthYear(courseData.lastModified)}
            />
          </Stack>

          {/* Topics Section inside Sidebar */}
          {courseData.topics?.length > 0 && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  color: 'text.primary',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Topics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {courseData.topics.map(topic => (
                  <Chip
                    key={topic.id}
                    label={topic.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      fontWeight: 500,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'background.alt' },
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  )
}

/** Mini list item used in "This course includes" */
const SidebarItem = ({ icon, text }) => (
  <ListItem sx={{ px: 0, py: 0.6 }}>
    <ListItemIcon sx={{ minWidth: 30 }}>{icon}</ListItemIcon>
    <ListItemText
      primary={text}
      slotProps={{
        primary: {
          variant: 'body2',
          color: 'text.primary',
          sx: { fontSize: '0.875rem' },
        },
      }}
    />
  </ListItem>
)

/** Key-value row used in "Course Info" */
const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {icon}
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} color="text.primary">
      {value}
    </Typography>
  </Box>
)

export default CourseSidebar