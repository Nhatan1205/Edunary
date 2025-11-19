import { Box, Typography, Rating, Chip, Stack} from '@mui/material'
import { Schedule, Update, Language } from '@mui/icons-material'
import { formatMonthYear} from '../../../../utils/helpers'
import MetaChip from '../../../../components/MetaChip';

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
        {courseData.category} • {courseData.topic}
      </Typography>
      
      <Typography 
        variant="h2" 
        component="h1" 
        sx={{ 
          fontWeight: 700, 
          mb: 2,
          color: 'text.primary',
          lineHeight: 1.3,
          maxWidth: '1000px' // Limit width for better readability
        }}
      >
        {courseData.title}
      </Typography>

      {courseData.subtitle && (
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            color: 'text.secondary',
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: '850px'
          }}
        >
          {courseData.subtitle}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Typography 
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#FAAF00',
            lineHeight: 1,          // giảm line-height
            fontSize: '0.875rem'    // đảm bảo tương đương size="small" của Rating
          }}
        >
          {courseData.ratings}
        </Typography>

        <Rating 
          value={3}
          precision={0.5} 
          size="small"
          readOnly
          sx={{ display: 'flex', alignItems: 'center' }} // thêm dòng này
        />

        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center' // thêm dòng này
          }}
        >
          • {courseData.totalStudents} students
        </Typography>
      </Box>



      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Typography
          variant="body1"
          color="text.primary"
          sx={{ fontWeight: 600 }}
        >
          Created by {courseData.instructorName}
        </Typography>
        </Box>

      <Stack direction="row" spacing={0.5} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {courseData.totalStudents > -1 && (
            <MetaChip
                label={"Bestseller"}
                backgroundColor={"#eceb98"}
                color={"#3d3c0a"}
                borderColor={"#eceb98"}
            />
          )}
        <Chip
          icon={<Schedule sx={{ fontSize: '16px !important' }} />}
          label={courseData?.content?.TotalVideoDuration}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.tertiary',
            color: 'text.secondary'
          }}
        />

        <Chip
          icon={<Language sx={{ fontSize: '16px !important' }} />}
          label={courseData.language}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.tertiary',
            color: 'text.secondary'
          }}
        />
        <Chip
          icon={<Update sx={{ fontSize: '16px !important' }} />}
          label={`Updated ${formatMonthYear(courseData.lastModified)}`}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.tertiary',
            color: 'text.secondary'
          }}
        />
        
      </Stack>
    </Box>
  )
}

export default CourseHeader