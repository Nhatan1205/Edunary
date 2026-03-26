import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useTheme } from '@mui/material/styles'

const CareerPathAbout = ({ careerPath }) => {
  const theme = useTheme()

  const objectives = careerPath.objectives || [
    'Understand core product design principles and thinking',
    'Apply user research methods to real-world problems',
    'Create wireframes, prototypes, and full design systems',
    'Use AI tools to speed up your design workflow',
    'Build a professional portfolio ready for job applications',
    'Earn a professional certification recognized by top companies',
  ]

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={2} color="text.primary">
        About this career path
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3} sx={{ maxWidth: 680 }}>
        {careerPath.about ||
          `This career path is designed to take you from beginner to job-ready in ${careerPath.title}. 
          Through a structured curriculum of courses, hands-on projects, and mentorship, 
          you will gain the skills employers are looking for and earn a professional certification 
          upon completion.`}
      </Typography>

      <Typography variant="h6" fontWeight={700} mb={2} color="text.primary">
        What you will learn
      </Typography>

      <List disablePadding>
        {objectives.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 34 }}>
              <CheckCircleOutlineIcon sx={{ color: theme.palette.brand.main, fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText
              primary={item}
              primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default CareerPathAbout
