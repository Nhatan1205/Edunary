import { Box, Typography, Rating } from '@mui/material'

const CourseHeader = ({ courseData }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {courseData.category}
      </Typography>
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
        {courseData.title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium' }}>
          {courseData.instructor}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={courseData.rating} precision={0.1} size="small" readOnly />
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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