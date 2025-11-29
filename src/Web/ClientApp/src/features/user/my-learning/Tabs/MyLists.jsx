import React from 'react'
import { Box, Typography } from '@mui/material'

function MyLists() {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h4" color="text.secondary">
        Coming Soon
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
        My Lists content will be available soon.
      </Typography>
    </Box>
  )
}

export default MyLists