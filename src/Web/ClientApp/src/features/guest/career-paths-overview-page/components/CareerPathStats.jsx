import { Box, Typography, Divider } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PublicIcon from '@mui/icons-material/Public'
import CardMembershipIcon from '@mui/icons-material/CardMembership'
import { useTheme } from '@mui/material/styles'

const StatItem = ({ icon, primary, secondary }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 1.5, md: 3 },
        py: { xs: 1.5, md: 0 },
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, whiteSpace: 'nowrap' }}
        >
          {primary}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', whiteSpace: 'nowrap', display: 'block' }}
        >
          {secondary}
        </Typography>
      </Box>
    </Box>
  )
}

const CareerPathStats = ({ careerPath }) => {
  const theme = useTheme()
  const brandColor = theme.palette.brand?.main ?? '#2DC9A0'

  const stats = [
    {
      icon: <BarChartIcon sx={{ color: brandColor, fontSize: 22 }} />,
      primary: careerPath?.skillLevel || 'Beginner',
      secondary: 'Skill level',
    },
    {
      icon: <AccessTimeIcon sx={{ color: brandColor, fontSize: 22 }} />,
      primary: careerPath?.duration || '3 months',
      secondary: 'Time to complete',
    },
    {
      icon: <PublicIcon sx={{ color: brandColor, fontSize: 22 }} />,
      primary: '100% online',
      secondary: 'Learn at your own pace',
    },
    {
      icon: <CardMembershipIcon sx={{ color: brandColor, fontSize: 22 }} />,
      primary: 'Official credentials',
      secondary: 'Professional Certification',
    },
  ]

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'stretch',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        bgcolor: '#f9f9fb',
        my: 3,
        overflow: 'hidden',
      }}
    >
      {stats.map((stat, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: { xs: '1 1 45%', md: 1 },
            py: { xs: 1.5, md: 2 },
          }}
        >
          <StatItem icon={stat.icon} primary={stat.primary} secondary={stat.secondary} />
        </Box>
      ))}
    </Box>
  )
}

export default CareerPathStats