import { Box, Typography, Rating, Chip, Stack} from '@mui/material'
import { Schedule, TrendingUp, Update, Language, Check } from '@mui/icons-material'
import { Container} from 'reactstrap'

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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Typography 
          variant="body1" 
          color="text.primary" 
          sx={{ fontWeight: 600 }}
        >
          Created by {courseData.instructorName}
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

      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Chip
          icon={<TrendingUp sx={{ fontSize: '16px !important' }} />}
          label={courseData.level}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'brand.main',
            color: 'brand.main',
            '& .MuiChip-icon': {
              color: 'brand.main'
            }
          }}
        />
        
        <Chip
          icon={<Schedule sx={{ fontSize: '16px !important' }} />}
          label={courseData.duration}
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
          label={`Updated ${courseData.lastUpdated}`}
          variant="outlined"
          size="small"
          sx={{
            borderColor: 'text.tertiary',
            color: 'text.secondary'
          }}
        />
      </Stack>

      <Container className="py-4 px-0 bord">
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            padding: "32px",
            backgroundColor: "white",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              marginBottom: 3,
              fontSize: '24px',
              color: '#1c1d1f'
            }}
          >
            What you'll learn
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Array.from({ 
                length: Math.ceil(courseData?.learningObjectives.length / 2) 
              }).map((_, rowIndex) => {
                const leftItem = courseData?.learningObjectives[rowIndex];
                const rightItem = courseData?.learningObjectives[rowIndex + Math.ceil(courseData?.learningObjectives.length / 2)];
                
                return (
                  <tr key={rowIndex}>
                    <td style={{ 
                      width: '50%', 
                      padding: '6px 16px 6px 0',
                      verticalAlign: 'top'
                    }}>
                      {leftItem && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Check
                            sx={{
                              fontSize: '16px',
                              mr: 1.5,
                              mt: '2px',
                              flexShrink: 0,
                              color: '#1c1d1f'
                            }}
                          />
                          <span 
                            dangerouslySetInnerHTML={{ __html: leftItem }}
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.4',
                              color: '#1c1d1f'
                            }}
                          />
                        </Box>
                      )}
                    </td>
                    <td style={{ 
                      width: '50%', 
                      padding: '6px 0 6px 16px',
                      verticalAlign: 'top'
                    }}>
                      {rightItem && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <Check
                            sx={{
                              fontSize: '16px',
                              mr: 1.5,
                              mt: '2px',
                              flexShrink: 0,
                              color: '#1c1d1f'
                            }}
                          />
                          <span 
                            dangerouslySetInnerHTML={{ __html: rightItem }}
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.4',
                              color: '#1c1d1f'
                            }}
                          />
                        </Box>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Container>
    </Box>
  )
}

export default CourseHeader