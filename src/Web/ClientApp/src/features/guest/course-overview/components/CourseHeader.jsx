import { Box, Typography, Rating } from '@mui/material'

const CourseHeader = ({ courseData }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="body2" 
        color="text.tertiary" 
        sx={{ 
          mb: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500
        }}
      >
        {courseData.category}
      </Typography>
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'text.primary',
          lineHeight: 1.3
        }}
      >
        {courseData.title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Typography 
          variant="body1" 
          color="brand.main" 
          sx={{ fontWeight: 600 }}
        >
          {courseData.instructor}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating 
            value={courseData.rating} 
            precision={0.1} 
            size="small" 
            readOnly 
            sx={{
              '& .MuiRating-iconFilled': {
                color: 'brand.main',
              }
            }}
          />
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary' 
            }}
          >
            {courseData.rating}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ({courseData.totalRatings.toLocaleString()} ratings)
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default CourseHeader