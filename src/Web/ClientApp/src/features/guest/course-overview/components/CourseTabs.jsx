import { useState } from 'react'
import { Box, Tabs, Tab, Divider, Typography, Avatar, Button } from '@mui/material'

const CourseTabs = ({ courseData, reviews }) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderDescription = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        About Course
      </Typography>
      <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
        {courseData.description}
      </Typography>
    </Box>
  )

  const renderCourses = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        Course Content
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Course curriculum will be displayed here.
      </Typography>
    </Box>
  )

  const renderReviews = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Review
      </Typography>
      <Box sx={{ mb: 3 }}>
        {reviews.map((review, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar src={review.avatar} sx={{ width: 40, height: 40, backgroundColor: 'primary.main' }}>
                {review.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {review.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {review.review}
                </Typography>
              </Box>
            </Box>
            {index < reviews.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Button variant="outlined" color="primary">
          Load more reviews
        </Button>
      </Box>
    </Box>
  )

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: 'primary.main !important',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tab label="Description" />
          <Tab label="Courses" />
          <Tab label="Review" />
        </Tabs>
        <Divider sx={{ mt: 2 }} />
      </Box>

      <Box>
        {activeTab === 0 && renderDescription()}
        {activeTab === 1 && renderCourses()}
        {activeTab === 2 && renderReviews()}
      </Box>
    </>
  )
}

export default CourseTabs