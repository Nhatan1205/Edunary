import { useState } from 'react'
import { Box, Tabs, Tab, Divider, Typography, Avatar, Button } from '@mui/material'

const CourseTabs = ({ courseData, reviews }) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderDescription = () => (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'text.primary'
        }}
      >
        About Course
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          lineHeight: 1.7, 
          color: 'text.secondary',
          fontSize: '1.1rem'
        }}
      >
        {courseData.description}
      </Typography>
    </Box>
  )

  const renderCourses = () => (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 3,
          color: 'text.primary'
        }}
      >
        Course Content
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ fontSize: '1.1rem' }}
      >
        Course curriculum will be displayed here.
      </Typography>
    </Box>
  )

  const renderReviews = () => (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 4,
          color: 'text.primary'
        }}
      >
        Reviews
      </Typography>
      <Box sx={{ mb: 4 }}>
        {reviews.map((review, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              <Avatar 
                src={review.avatar} 
                sx={{ 
                  width: 48, 
                  height: 48, 
                  backgroundColor: 'brand.main',
                  color: 'text.inverse',
                  fontWeight: 600
                }}
              >
                {review.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: 'text.primary'
                  }}
                >
                  {review.name}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    lineHeight: 1.7,
                    fontSize: '1rem'
                  }}
                >
                  {review.review}
                </Typography>
              </Box>
            </Box>
            {index < reviews.length - 1 && (
              <Divider 
                sx={{ 
                  mt: 3,
                  borderColor: 'divider'
                }} 
              />
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="outlined"
          sx={{
            borderColor: 'brand.main',
            color: 'brand.main',
            fontWeight: 500,
            px: 3,
            py: 1.5,
            borderRadius: 1.5,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'brand.lighter',
              borderColor: 'brand.main',
            }
          }}
        >
          Load more reviews
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box 
      sx={{ 
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ px: 3, pt: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              color: 'text.tertiary',
              px: 3,
              py: 2,
              '&.Mui-selected': {
                color: 'brand.main',
                fontWeight: 600,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'brand.main',
              height: 3,
              borderRadius: '3px 3px 0 0'
            },
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tab label="Description" />
          <Tab label="Content" />
          <Tab label="Reviews" />
        </Tabs>
      </Box>

      <Box sx={{ px: 3, pb: 3 }}>
        {activeTab === 0 && renderDescription()}
        {activeTab === 1 && renderCourses()}
        {activeTab === 2 && renderReviews()}
      </Box>
    </Box>
  )
}

export default CourseTabs