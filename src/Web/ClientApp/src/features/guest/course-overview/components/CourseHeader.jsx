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
          fontWeight: 500,
          color: 'text.inverse'
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
          lineHeight: 1.3,
          color: 'text.inverse',
          wordBreak: "break-word",
        }}
      >
        {courseData.title}
      </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            color: '#F3F3F3',
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: '850px',
            wordBreak: "break-word",
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: "2.6em",
          }}
        >
          {courseData.subtitle}
        </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        <Typography 
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#FAAF00',
            lineHeight: 1,
            fontSize: '0.875rem'
          }}
        >
          {courseData.ratings}
        </Typography>

        <Rating
          value={courseData.ratings}
          precision={0.5} 
          size="small"
          readOnly
          sx={{
            display: 'flex',
            alignItems: 'center',
            '& .MuiRating-iconFilled': {
              color: '#FAAF00',
            },
            '& .MuiRating-iconEmpty': {
              color: '#FAAF00',
            },
          }}
        />

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.inverse',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          • {courseData.totalStudents} students
        </Typography>
      </Box>



      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Typography
          variant="body1"
          color="text.inverse"
        >
          Created by{" "}
          <Typography
            component="span"
            sx={{
              fontWeight: 600,
              textDecoration: 'underline',
              color: 'brand.light',
              wordBreak: "break-word",
            }}
          >
            {courseData.instructorName}
          </Typography>
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
          icon={<Schedule sx={{ fontSize: '16px !important'}} />}
          label={courseData?.content?.TotalVideoDuration || "8 hours"}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.inverse',
            color: 'text.inverse',
            '& .MuiChip-icon': {
              color: 'text.inverse'
            }
          }}
        />

        <Chip
          icon={<Language sx={{ fontSize: '16px !important'}} />}
          label={courseData.language}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.inverse',
            color: 'text.inverse',
            '& .MuiChip-icon': {
              color: 'text.inverse'
            }
          }}
        />
        <Chip
          icon={<Update sx={{ fontSize: '16px !important' }} />}
          label={`Updated ${formatMonthYear(courseData.lastModified)}`}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.inverse',
            color: 'text.inverse',
            '& .MuiChip-icon': {
              color: 'text.inverse'
            }
          }}
        />
        
      </Stack>
    </Box>
  )
}

export default CourseHeader