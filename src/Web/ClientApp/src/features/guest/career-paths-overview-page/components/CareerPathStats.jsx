import { Box, Typography } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import CategoryIcon from '@mui/icons-material/Category'
import PublicIcon from '@mui/icons-material/Public'
import CardMembershipIcon from '@mui/icons-material/CardMembership'
import { getLevelLabel } from '../../../../utils/helpers'

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
  const brandColor = 'brand.main'

  const stats = [
    {
      icon: <BarChartIcon sx={{ color: brandColor, fontSize: 22 }} />,
      primary: getLevelLabel(careerPath?.skillLevel),
      secondary: 'Skill level',
    },
    {
      icon: <CategoryIcon sx={{ color: brandColor, fontSize: 22 }} />,
      primary: careerPath?.topic?.title || 'General',
      secondary: 'Topic',
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
        borderRadius: 3,
        display: 'flex',
        alignItems: 'stretch',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        bgcolor: 'background.alt',
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