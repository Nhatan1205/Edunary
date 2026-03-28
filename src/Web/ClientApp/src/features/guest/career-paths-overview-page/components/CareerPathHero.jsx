import { Box, Typography, Avatar } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Row, Col } from 'reactstrap'

const CareerPathHero = ({ careerPath }) => {

  const handleCreatorClick = () => {
    if (careerPath.creator?.id) {
      window.open(`/profile/${careerPath.creator.id}`, '_blank')
    }
  }

  return (
    <Box sx={{ pt: 4 }}>
      <Row className="align-items-center">
        {/* Left column */}
        <Col xs={12} md={7}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <ArrowBackIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Link to="/career-paths" style={{ textDecoration: 'none', fontSize: '0.85rem', color: 'inherit', opacity: 0.7 }}>
              Career Paths
            </Link>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>/</Typography>
            <Typography variant="caption" sx={{ color: 'text.primary' }}>
              {careerPath.title}
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 2,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            {careerPath.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mb: 3, maxWidth: 500, lineHeight: 1.7 }}
          >
            {careerPath.subtitle}
          </Typography>

          {/* Avatar + creator */}
          <Box
            onClick={handleCreatorClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: careerPath.creator?.id ? 'pointer' : 'default',
              '&:hover': careerPath.creator?.id ? { textDecoration: 'underline' } : {},
            }}
          >
            <Avatar
              src={careerPath.creator?.avatar}
              alt={careerPath.creator?.name}
              sx={{
                width: 36,
                height: 36,
                border: '2px solid',
                borderColor: 'brand.light',
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              Created by{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  cursor: 'pointer',
                }}
              >
                {careerPath.creator?.name}
              </Box>
            </Typography>
          </Box>
        </Col>
      </Row>
    </Box>
  )
}

export default CareerPathHero
