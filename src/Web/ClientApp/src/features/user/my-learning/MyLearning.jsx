import React, { useState } from 'react'
import { Box, Typography, Tabs, Tab } from '@mui/material'
import { Container } from "reactstrap";
import AllCourses from './Tabs/AllCourses';
import MyLists from './Tabs/MyLists';
import Wishlist from './Tabs/Wishlist';
import Certifications from './Tabs/Certifications';
import Archived from './Tabs/Archived';
import LearningTools from './Tabs/LearningTools';
import MyCareerPathsTab from './Tabs/MyCareerPathsTab';

function MyLearning() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box component={"main"} sx={{ bgcolor: "background.default", minHeight: '100vh' }}>
      <Box sx={(theme) => ({
        background: `linear-gradient(135deg, ${theme.palette.brand.dark} 0%, ${theme.palette.brand.main} 50%, ${theme.palette.brand.light} 100%)`,
        color: 'white',
        pt: 4,
      })}>
        <Container className="my-4">
          <Typography variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "1.5rem", md: "2rem" },
            }}>
            My learning
          </Typography>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'white',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                minWidth: 'auto',
                px: 2,
                '&.Mui-selected': {
                  color: 'white',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3,
              },
            }}
          >
            <Tab label="All courses" />
            <Tab label="My Lists" />
            <Tab label="Wishlist" />
            <Tab label="Certifications" />
            <Tab label="Archived" />
            <Tab label="Career Paths" />
            <Tab label="Learning tools" />
          </Tabs>
        </Container>
      </Box>
      <Container className="my-4">
        {activeTab === 0 && <AllCourses />}
        {activeTab === 1 && <MyLists />}
        {activeTab === 2 && <Wishlist />}
        {activeTab === 3 && <Certifications />}
        {activeTab === 4 && <Archived />}
        {activeTab === 5 && <MyCareerPathsTab />}
        {activeTab === 6 && <LearningTools />}
      </Container>
    </Box>
  )
}

export default MyLearning