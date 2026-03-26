import { Box, Typography, Button, Chip, Paper } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PeopleIcon from '@mui/icons-material/People'
import { useTheme } from '@mui/material/styles'
import { Row, Col } from 'reactstrap'

const CareerPathHero = ({ careerPath }) => {
  const theme = useTheme()

  return (
    <Box sx={{ py: 5, bgcolor: 'background.default' }}>
      <Row className="align-items-center">
        {/* Left column */}
        <Col xs={12} md={7}>
          {/* Breadcrumb */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <ArrowBackIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Link to="/career-paths" style={{ color: theme.palette.text.secondary, textDecoration: 'none', fontSize: '0.85rem' }}>
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

          {/* Description */}
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', mb: 3, maxWidth: 500, lineHeight: 1.7 }}
          >
            {careerPath.description}
          </Typography>

          {/* Enroll + Learners */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: theme.palette.brand.main,
                color: '#fff',
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': { bgcolor: theme.palette.brand.dark },
              }}
            >
              Enroll now
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                <strong>{careerPath.learnersCount}</strong> learners enrolled
              </Typography>
            </Box>
          </Box>
        </Col>
      </Row>
    </Box>
  )
}

export default CareerPathHero
