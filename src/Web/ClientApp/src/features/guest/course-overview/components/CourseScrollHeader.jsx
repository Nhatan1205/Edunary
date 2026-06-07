import { useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Rating,
} from '@mui/material'
import { Link as RouterLink } from 'react-router'
import DefaultImage from '../../../../assets/images/default.jpg'
import { Container } from 'reactstrap'
import { Star } from '@mui/icons-material'

const CourseScrollHeader = ({ courseData, triggerOffset = 300 }) => {
  const headerRef = useRef(null)
  const owner = courseData?.instructors?.[0]

  useEffect(() => {
    const handleScroll = () => {
      const el = headerRef.current
      if (!el) return
      if (window.scrollY > triggerOffset) {
        el.style.transform = 'translateY(0)'
        el.style.opacity = '1'
      } else {
        el.style.transform = 'translateY(-100%)'
        el.style.opacity = '0'
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [triggerOffset])

  return (
    <Box
      ref={headerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100, // lower than sidebar (1200) to allow overlap
        bgcolor: '#1c1d1f', // Dark background
        borderBottom: '1px solid',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        transform: 'translateY(-100%)',
        opacity: 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        willChange: 'transform, opacity',
      }}
    >
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 380px' },
            gap: { xs: 3, md: 5 },
            alignItems: 'center',
            py: 1.5,
            minHeight: 80,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
            {/* Course thumbnail */}
            <Box
              component="img"
              src={courseData?.imageUrl || DefaultImage}
              alt={courseData?.title}
              sx={{
                width: 80,
                height: 48,
                objectFit: 'cover',
                borderRadius: 1,
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' },
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {courseData?.title}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  columnGap: 2,
                  rowGap: 0.5,
                }}
              >
                {owner && (
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    A course by{' '}
                    <Typography
                      component={RouterLink}
                      to={`/profile/${owner.id}`}
                      target="_blank"
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'brand.main',
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'brand.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {owner.name}
                    </Typography>
                  </Typography>
                )}

                {/* Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontStyle: 'normal',
                      lineHeight: 1,
                    }}
                    color="#ffb400"
                  >
                    {courseData?.ratings?.toFixed(1)}
                  </Typography>
                  <Star sx={{ fontSize: 15, color: '#ffb400', mt: '-1px' }} />
                  {courseData?.totalRatings > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontStyle: 'normal',
                        lineHeight: 1,
                      }}
                      color="rgba(255, 255, 255, 0.5)"
                    >
                      ({courseData.totalRatings})
                    </Typography>
                  )}
                </Box>

                {/* Students */}
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  {courseData?.totalStudents?.toLocaleString()} students
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Column: Empty space for sidebar overlap */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }} />
        </Box>
      </Container>
    </Box>
  )
}

export default CourseScrollHeader
