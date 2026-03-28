import { Box, Typography } from '@mui/material'

const CareerPathAbout = ({ careerPath }) => {
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
        About this career path
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3} sx={{ maxWidth: 680 }}>
        {careerPath.description ||
          `This career path is designed to take you from beginner to job-ready in ${careerPath.title}. 
          Through a structured curriculum of courses, hands-on projects, and mentorship, 
          you will gain the skills employers are looking for and earn a professional certification 
          upon completion.`}
      </Typography>
    </Box>
  )
}

export default CareerPathAbout
